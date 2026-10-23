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
 * First-paint guard for the inline gtag bootstrap. Uses the same exact
 * host list and `location.hostname` so one preview/production artifact
 * stays silent off the production hosts.
 */
export function analyticsHostAllowlistGuardSnippet(): string {
  return `var __cwAnalyticsAllowedHosts = ${JSON.stringify(ANALYTICS_ALLOWED_HOSTS)};
    if (__cwAnalyticsAllowedHosts.indexOf(String(location.hostname || "").toLowerCase()) === -1) return;`;
}
