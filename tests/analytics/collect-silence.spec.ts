import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { ANALYTICS_IMMEDIATE_LOAD_FLAG } from "../../shared/analyticsHosts";
import {
  APP_MARKER,
  LOOKALIKE_HOSTS,
  installDefaultDeny,
  localOrigin,
  originForHost,
  summarizeLedger,
  type NetworkLedger,
} from "./networkGuard";

function isAppHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app")
  );
}

async function assertBlockedHost(
  page: Page,
  ledger: NetworkLedger,
  expectedHostname: string,
  startUrl: string,
): Promise<{
  hostname: string;
  gtagType: string;
  gtagScriptCount: number;
  hotjarScriptCount: number;
}> {
  const home = await page.goto(startUrl, { waitUntil: "networkidle" });
  expect(home?.ok(), `home status ${home?.status()} at ${page.url()}`).toBe(true);
  await expect(page.locator(APP_MARKER)).toBeAttached();
  await page.locator("body").click({ position: { x: 12, y: 12 } });
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(1500);

  const about = await page.goto(
    new URL("/about", startUrl).toString(),
    { waitUntil: "networkidle" },
  );
  expect(about?.ok(), `about status ${about?.status()} at ${page.url()}`).toBe(
    true,
  );
  await expect(page.locator(APP_MARKER)).toBeAttached();
  await page.waitForTimeout(800);

  const runtime = await page.evaluate(() => ({
    hostname: window.location.hostname,
    gtagType: typeof (window as Window & { gtag?: unknown }).gtag,
    gtagScriptCount: document.querySelectorAll(
      'script[src*="googletagmanager.com/gtag/js"]',
    ).length,
    hotjarScriptCount: document.querySelectorAll(
      'script[src*="static.hotjar.com"]',
    ).length,
    vercelInsightsScriptCount: document.querySelectorAll(
      'script[src*="/_vercel/insights"], script[src*="va.vercel-scripts.com"]',
    ).length,
  }));

  expect(runtime.hostname).toBe(expectedHostname);
  expect(runtime.gtagType).toBe("undefined");
  expect(runtime.gtagScriptCount).toBe(0);
  expect(runtime.hotjarScriptCount).toBe(0);
  expect(runtime.vercelInsightsScriptCount).toBe(0);
  expect(
    ledger.hotjar,
    `Hotjar must never be requested on ${expectedHostname}:\n${ledger.hotjar
      .map((item) => item.url)
      .join("\n")}`,
  ).toEqual([]);
  expect(
    ledger.gtagScript,
    `gtag.js must never be requested on ${expectedHostname}`,
  ).toEqual([]);
  expect(
    ledger.googleMeasurement,
    `Google measurement must never be requested on ${expectedHostname}`,
  ).toEqual([]);
  expect(
    ledger.stubbed.map((item) => item.url),
    `No third-party request may be attempted on ${expectedHostname}`,
  ).toEqual([]);

  return runtime;
}

test("non-production hosts do not load or collect to GA4/GTM", async ({
  page,
  context,
}, testInfo) => {
  const local = localOrigin(testInfo.project.use.baseURL);

  await context.addInitScript((flag: string) => {
    (window as Window & Record<string, unknown>)[flag] = true;
  }, ANALYTICS_IMMEDIATE_LOAD_FLAG);

  const ledger = await installDefaultDeny(context, local);
  const startPath = process.env.ANALYTICS_START_PATH?.trim() || "/";
  const runtime = await assertBlockedHost(
    page,
    ledger,
    new URL(local.toString()).hostname,
    new URL(startPath, local).toString(),
  );

  expect(
    isAppHost(runtime.hostname),
    `Expected the app host (localhost or *.vercel.app). Got ${runtime.hostname}`,
  ).toBe(true);
  expect(
    runtime.hostname === "chriswongdds.com" ||
      runtime.hostname === "www.chriswongdds.com",
  ).toBe(false);

  const artifactDir =
    process.env.ANALYTICS_NETWORK_ARTIFACT_DIR?.trim() || testInfo.outputDir;
  mkdirSync(artifactDir, { recursive: true });
  writeFileSync(
    join(artifactDir, "ga-collect-silence.json"),
    `${JSON.stringify(
      {
        baseURL: testInfo.project.use.baseURL,
        pageURL: page.url(),
        runtime,
        network: summarizeLedger(ledger),
      },
      null,
      2,
    )}\n`,
  );
  await page.screenshot({
    path: join(artifactDir, "ga-collect-silence.png"),
    fullPage: true,
  });
});

for (const lookalike of LOOKALIKE_HOSTS) {
  test(`${lookalike} does not load gtag or Hotjar`, async ({
    page,
    context,
  }, testInfo) => {
    const local = localOrigin(testInfo.project.use.baseURL);

    await context.addInitScript((flag: string) => {
      (window as Window & Record<string, unknown>)[flag] = true;
    }, ANALYTICS_IMMEDIATE_LOAD_FLAG);

    const ledger = await installDefaultDeny(context, local);
    const runtime = await assertBlockedHost(
      page,
      ledger,
      lookalike,
      `${originForHost(local, lookalike)}/`,
    );

    const artifactDir =
      process.env.ANALYTICS_NETWORK_ARTIFACT_DIR?.trim() || testInfo.outputDir;
    mkdirSync(artifactDir, { recursive: true });
    writeFileSync(
      join(artifactDir, `ga-collect-lookalike-${lookalike}.json`),
      `${JSON.stringify(
        {
          baseURL: testInfo.project.use.baseURL,
          pageURL: page.url(),
          runtime,
          network: summarizeLedger(ledger),
        },
        null,
        2,
      )}\n`,
    );
  });
}
