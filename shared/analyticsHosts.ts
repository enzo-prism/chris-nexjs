/**
 * Production hostnames that may load or send analytics tags (GA4/gtag,
 * Google Ads, Hotjar, Vercel Web Analytics).
 *
 * Exact hostname match only — never substring, suffix, or wildcard checks
 * that would admit lookalikes such as evilchriswongdds.com.
 */
export const ANALYTICS_ALLOWED_HOSTS = [
  "chriswongdds.com",
  "www.chriswongdds.com",
] as const;

const ANALYTICS_ALLOWED_HOST_SET: ReadonlySet<string> = new Set(
  ANALYTICS_ALLOWED_HOSTS,
);

export function normalizeAnalyticsHostname(hostname: string): string {
  const trimmed = hostname.trim().toLowerCase();
  const withPort = trimmed.match(/^(.*):(\d+)$/);
  return withPort ? withPort[1] : trimmed;
}

export function isAllowedAnalyticsHost(hostname: string): boolean {
  return ANALYTICS_ALLOWED_HOST_SET.has(normalizeAnalyticsHostname(hostname));
}

/**
 * Test-only window flag. When set, deferred tag loaders skip their 8s/idle
 * timers so a missing host guard is visible to Playwright immediately.
 */
export const ANALYTICS_IMMEDIATE_LOAD_FLAG = "__cwAnalyticsImmediate";

export function hostnameFromRequestHeaders(
  headers: { readonly get: (name: string) => string | null },
  fallbackHostname = "",
): string {
  // Prefer Host: the platform sets it to the serving hostname. Clients can
  // spoof x-forwarded-host, so it must not override a preview Host.
  const host =
    headers.get("host") ??
    headers.get("x-forwarded-host") ??
    fallbackHostname;
  return host.split(",")[0]?.trim() ?? "";
}

export function canSendServerAnalytics(
  hostname: string,
  env: Record<string, string | undefined>,
): boolean {
  if (!isAllowedAnalyticsHost(hostname)) return false;
  return Boolean(
    env.VERCEL_URL?.trim() || env.VERCEL_WEB_ANALYTICS_ENDPOINT?.trim(),
  );
}

/**
 * First-paint guard for the inline gtag bootstrap. Uses the same exact
 * host list and `location.hostname` so one preview/production artifact
 * stays silent off the production hosts.
 */
export function analyticsHostAllowlistGuardSnippet(): string {
  return `var __cwAnalyticsAllowedHosts = ${JSON.stringify(ANALYTICS_ALLOWED_HOSTS)};
    if (__cwAnalyticsAllowedHosts.indexOf(String(location.hostname || "").toLowerCase()) === -1) return;`;
}
