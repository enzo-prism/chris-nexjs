import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";

const TRACKING_HOSTS = ["google-analytics.com", "googletagmanager.com"] as const;

function isTrackingHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return TRACKING_HOSTS.some(
    (root) => host === root || host.endsWith(`.${root}`),
  );
}

function isCollectPath(pathname: string): boolean {
  return (
    pathname === "/collect" ||
    pathname.endsWith("/collect") ||
    pathname.includes("/g/collect") ||
    pathname.includes("/r/collect") ||
    pathname.includes("/j/collect")
  );
}

function redactShareToken(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("_vercel_share")) {
      parsed.searchParams.set("_vercel_share", "[redacted]");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function isAppHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app")
  );
}

test("non-production hosts do not load or collect to GA4/GTM", async ({
  page,
}, testInfo) => {
  const allRequests: string[] = [];
  const trackingRequests: string[] = [];
  const collectRequests: string[] = [];

  page.on("request", (request) => {
    allRequests.push(request.url());
    let parsed: URL;
    try {
      parsed = new URL(request.url());
    } catch {
      return;
    }
    if (!isTrackingHost(parsed.hostname)) return;
    trackingRequests.push(request.url());
    if (isCollectPath(parsed.pathname)) {
      collectRequests.push(request.url());
    }
  });

  const startPath = process.env.ANALYTICS_START_PATH?.trim() || "/";
  await page.goto(startPath, { waitUntil: "networkidle" });
  await page.locator("body").click({ position: { x: 12, y: 12 } });
  await page.mouse.wheel(0, 600);
  // The production bootstrap defers gtag.js by 4s + idle. Wait past that
  // window so a missed guard would still show up in the request log.
  await page.waitForTimeout(6500);
  await page.goto("/about", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const runtime = await page.evaluate(() => ({
    hostname: window.location.hostname,
    gtagType: typeof (window as Window & { gtag?: unknown }).gtag,
    dataLayerType: typeof (window as Window & { dataLayer?: unknown }).dataLayer,
    gtagScriptCount: document.querySelectorAll(
      'script[src*="googletagmanager.com/gtag/js"]',
    ).length,
    hotjarScriptCount: document.querySelectorAll(
      'script[src*="static.hotjar.com"]',
    ).length,
  }));

  const artifactDir =
    process.env.ANALYTICS_NETWORK_ARTIFACT_DIR?.trim() || testInfo.outputDir;
  mkdirSync(artifactDir, { recursive: true });
  const report = {
    baseURL: testInfo.project.use.baseURL,
    pageURL: redactShareToken(page.url()),
    runtime,
    requestCount: allRequests.length,
    trackingRequests: trackingRequests.map(redactShareToken),
    collectRequests: collectRequests.map(redactShareToken),
    firstPartySample: allRequests
      .filter((url) => {
        try {
          return !isTrackingHost(new URL(url).hostname);
        } catch {
          return false;
        }
      })
      .slice(0, 12)
      .map(redactShareToken),
  };
  writeFileSync(
    join(artifactDir, "ga-collect-silence.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  await page.screenshot({
    path: join(artifactDir, "ga-collect-silence.png"),
    fullPage: true,
  });

  expect(
    isAppHost(runtime.hostname),
    `Expected the app host (localhost or *.vercel.app), not a protection login. Got ${runtime.hostname} at ${redactShareToken(page.url())}`,
  ).toBe(true);
  expect(
    runtime.hostname === "chriswongdds.com" ||
      runtime.hostname === "www.chriswongdds.com",
    `This spec is a silence check for non-production hosts; got ${runtime.hostname}`,
  ).toBe(false);
  expect(allRequests.length, "request listener captured no traffic").toBeGreaterThan(0);
  expect(runtime.gtagType).toBe("undefined");
  expect(runtime.gtagScriptCount).toBe(0);
  expect(
    collectRequests,
    `Collect hits:\n${collectRequests.join("\n")}`,
  ).toEqual([]);
  expect(
    trackingRequests,
    `GA/GTM requests:\n${trackingRequests.join("\n")}`,
  ).toEqual([]);
});
