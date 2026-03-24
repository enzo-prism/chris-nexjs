export const ANALYTICS_CONSENT_STORAGE_KEY = "analytics_consent";
export const ANALYTICS_CONSENT_EVENT = "analytics-consent-updated";
export const ANALYTICS_EXCLUDED_PATHS = ["/analytics", "/ga-test"] as const;

export type AnalyticsConsentState = "granted" | "denied";

export function normalizeAnalyticsPath(pathname: string): string {
  if (!pathname) return "/";
  return pathname === "/" ? "/" : pathname.replace(/\/+$/, "") || "/";
}

export function isAnalyticsPathExcluded(pathname: string): boolean {
  const normalizedPath = normalizeAnalyticsPath(pathname);
  return ANALYTICS_EXCLUDED_PATHS.includes(
    normalizedPath as (typeof ANALYTICS_EXCLUDED_PATHS)[number],
  );
}
