import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import { ANALYTICS_IMMEDIATE_LOAD_FLAG } from "../../shared/analyticsHosts";
import {
  ALLOWED_WWW_THIRD_PARTY_HOSTS,
  APP_MARKER,
  installDefaultDeny,
  localOrigin,
  originForHost,
  summarizeLedger,
} from "./networkGuard";

const GA_MEASUREMENT_ID = "G-94WRBJY51J";

// These specs stub gtag.js (and every other third-party host) and never
// reach Google collect. Production GA4 Realtime is the collect proof.

test("www.chriswongdds.com loads gtag and fires page_view", async ({
  page,
  context,
}, testInfo) => {
  const local = localOrigin(testInfo.project.use.baseURL);
  const startOrigin = originForHost(local, "www.chriswongdds.com");

  await context.addInitScript((flag: string) => {
    (window as Window & Record<string, unknown>)[flag] = true;
  }, ANALYTICS_IMMEDIATE_LOAD_FLAG);

  const ledger = await installDefaultDeny(context, local);

  const home = await page.goto(`${startOrigin}/`, { waitUntil: "networkidle" });
  expect(home?.ok(), `home status ${home?.status()} at ${page.url()}`).toBe(true);
  await expect(page.locator(APP_MARKER)).toBeAttached();
  await page.locator("body").click({ position: { x: 12, y: 12 } });
  await page.mouse.wheel(0, 600);

  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const layer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
          if (!Array.isArray(layer)) return false;
          return layer.some((entry) => {
            try {
              const list = Array.from(entry as ArrayLike<unknown>);
              return list[0] === "event" && list[1] === "page_view";
            } catch {
              return false;
            }
          });
        }),
      { timeout: 20_000 },
    )
    .toBe(true);

  await expect
    .poll(() => ledger.hotjar.length, { timeout: 15_000 })
    .toBeGreaterThan(0);

  const runtime = await page.evaluate(() => {
    const view = window as Window & {
      dataLayer?: unknown[];
      gtag?: unknown;
    };
    return {
      hostname: window.location.hostname,
      gtagType: typeof view.gtag,
      dataLayerHasPageView: Array.isArray(view.dataLayer)
        ? view.dataLayer.some((entry) => {
            try {
              const list = Array.from(entry as ArrayLike<unknown>);
              return list[0] === "event" && list[1] === "page_view";
            } catch {
              return false;
            }
          })
        : false,
      gtagScriptCount: document.querySelectorAll(
        'script[src*="googletagmanager.com/gtag/js"]',
      ).length,
      hotjarScriptCount: document.querySelectorAll(
        'script[src*="static.hotjar.com"]',
      ).length,
    };
  });

  const summary = summarizeLedger(ledger);
  const artifactDir =
    process.env.ANALYTICS_NETWORK_ARTIFACT_DIR?.trim() || testInfo.outputDir;
  mkdirSync(artifactDir, { recursive: true });
  writeFileSync(
    join(artifactDir, "ga-collect-allow.json"),
    `${JSON.stringify(
      {
        baseURL: testInfo.project.use.baseURL,
        pageURL: page.url(),
        runtime,
        network: summary,
      },
      null,
      2,
    )}\n`,
  );
  await page.screenshot({
    path: join(artifactDir, "ga-collect-allow.png"),
    fullPage: true,
  });

  const dataLayer = await page.evaluate(() => {
    const layer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
    if (!Array.isArray(layer)) return [];
    return layer.map((entry) => {
      try {
        return Array.from(entry as ArrayLike<unknown>);
      } catch {
        return [];
      }
    });
  });
  const configIndex = dataLayer.findIndex(
    (row) => row[0] === "config" && row[1] === GA_MEASUREMENT_ID,
  );
  const pageViewIndex = dataLayer.findIndex((row) => {
    const params = row[2];
    return (
      row[0] === "event" &&
      row[1] === "page_view" &&
      Boolean(params) &&
      typeof params === "object" &&
      !Array.isArray(params) &&
      (params as { send_to?: unknown }).send_to === GA_MEASUREMENT_ID
    );
  });

  expect(runtime.hostname).toBe("www.chriswongdds.com");
  expect(runtime.gtagType).toBe("function");
  expect(runtime.gtagScriptCount).toBeGreaterThan(0);
  expect(runtime.dataLayerHasPageView).toBe(true);
  expect(runtime.hotjarScriptCount).toBeGreaterThan(0);
  expect(ledger.gtagScript.length).toBeGreaterThan(0);
  expect(
    configIndex,
    `["config","${GA_MEASUREMENT_ID}"] must appear in dataLayer`,
  ).toBeGreaterThanOrEqual(0);
  expect(
    pageViewIndex,
    `page_view send_to ${GA_MEASUREMENT_ID} must follow config`,
  ).toBeGreaterThan(configIndex);
  expect(
    ledger.gtagScript.some((item) => item.url.includes(`id=${GA_MEASUREMENT_ID}`)),
    `gtag.js URL must contain id=${GA_MEASUREMENT_ID}`,
  ).toBe(true);
  expect(
    ledger.hotjar.every(
      (item) =>
        item.disposition === "stubbed" ||
        item.disposition === "websocket-stubbed",
    ),
    `Hotjar must be stubbed, not live:\n${summary.hotjar.join("\n")}`,
  ).toBe(true);
  expect(
    ledger.stubbed.length,
    "expected stubbed third-party traffic on the allowed host",
  ).toBeGreaterThan(0);
  const allowedThirdParty = new Set<string>(ALLOWED_WWW_THIRD_PARTY_HOSTS);
  expect(
    ledger.stubbed.map((item) => item.hostname).filter((host) => !allowedThirdParty.has(host)),
    "unexpected third-party host on www",
  ).toEqual([]);
});
