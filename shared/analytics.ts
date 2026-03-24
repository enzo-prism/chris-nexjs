export const ANALYTICS_CONSENT_STORAGE_KEY = "analytics_consent";
export const ANALYTICS_CONSENT_EVENT = "analytics-consent-updated";
export const ANALYTICS_EXCLUDED_PATHS = ["/analytics", "/ga-test"] as const;
const ANALYTICS_EVENT_NAME_MAX_LENGTH = 64;
const ANALYTICS_EVENT_VALUE_MAX_LENGTH = 255;

export type AnalyticsConsentState = "granted" | "denied";
export type AnalyticsEventPropertyValue =
  | string
  | number
  | boolean
  | null
  | undefined;

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

export function getAnalyticsPathFromUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  try {
    const parsedUrl = new URL(url, "https://www.chriswongdds.com");
    return normalizeAnalyticsPath(parsedUrl.pathname);
  } catch {
    return undefined;
  }
}

export function isAnalyticsUrlExcluded(url: string | null | undefined): boolean {
  const path = getAnalyticsPathFromUrl(url);
  return path ? isAnalyticsPathExcluded(path) : false;
}

export function sanitizeAnalyticsEventName(name: string): string {
  return name.trim().slice(0, ANALYTICS_EVENT_NAME_MAX_LENGTH);
}

export function sanitizeAnalyticsEventProperties(
  properties: Record<string, unknown>,
): Record<string, AnalyticsEventPropertyValue> | undefined {
  const sanitizedEntries = Object.entries(properties).flatMap(([key, value]) => {
    if (value === undefined) {
      return [];
    }

    if (typeof value === "string") {
      return [[key, value.slice(0, ANALYTICS_EVENT_VALUE_MAX_LENGTH)]];
    }

    if (
      value === null ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return [[key, value]];
    }

    return [];
  });

  if (sanitizedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(sanitizedEntries);
}
