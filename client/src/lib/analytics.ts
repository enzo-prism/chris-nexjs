import {
  ANALYTICS_EVENTS,
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
  isAnalyticsPathExcluded,
  sanitizeAnalyticsEventName,
  sanitizeAnalyticsEventProperties,
  sanitizeVercelEventProperties,
  type AnalyticsConsentState,
  type AnalyticsEventName,
} from "@shared/analytics";

const FALLBACK_GA_ALLOWED_HOSTS = new Set([
  "www.chriswongdds.com",
  "chriswongdds.com",
  "chris-nextjs.vercel.app",
  "chriswongdds.vercel.app",
]);
let vercelAnalyticsModulePromise: Promise<typeof import("@vercel/analytics")> | null =
  null;

export function isAnalyticsRuntimeEnabled(): boolean {
  if (typeof window === "undefined") return false;

  const explicitMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (explicitMeasurementId) return true;

  return FALLBACK_GA_ALLOWED_HOSTS.has(window.location.hostname);
}

export function getAnalyticsConsentState(): AnalyticsConsentState | null {
  if (typeof window === "undefined") return null;

  try {
    const state = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return state === "granted" || state === "denied" ? state : null;
  } catch (_error) {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return getAnalyticsConsentState() === "granted";
}

export function trackGAEvent(action: string, params: Record<string, unknown> = {}): void {
  if (
    typeof window === "undefined" ||
    typeof window.gtag !== "function" ||
    !isAnalyticsRuntimeEnabled() ||
    !hasAnalyticsConsent()
  ) {
    return;
  }

  const sanitizedEventName = sanitizeAnalyticsEventName(action);
  const sanitizedProperties = sanitizeAnalyticsEventProperties(params);

  if (!sanitizedEventName) return;
  window.gtag("event", sanitizedEventName, sanitizedProperties);
}

function canTrackVercelEvent(): boolean {
  if (typeof window === "undefined") return false;
  if (!hasAnalyticsConsent()) return false;
  return !isAnalyticsPathExcluded(window.location.pathname);
}

function loadVercelAnalyticsClient() {
  if (!vercelAnalyticsModulePromise) {
    vercelAnalyticsModulePromise = import("@vercel/analytics");
  }

  return vercelAnalyticsModulePromise;
}

export function trackVercelEvent(
  eventName: AnalyticsEventName,
  properties: Record<string, unknown> = {},
): void {
  const sanitizedEventName = sanitizeAnalyticsEventName(eventName);
  if (!sanitizedEventName || !canTrackVercelEvent()) return;

  const sanitizedProperties = sanitizeVercelEventProperties(
    sanitizedEventName,
    properties,
  );

  void loadVercelAnalyticsClient()
    .then(({ track }) => {
      track(sanitizedEventName, sanitizedProperties);
    })
    .catch(() => {
      // Ignore Vercel analytics load failures so product flows never fail.
    });
}

export function trackAnalyticsEvent(
  eventName: AnalyticsEventName,
  properties: Record<string, unknown> = {},
  options: {
    readonly ga?: boolean;
    readonly vercel?: boolean;
  } = {},
): void {
  const { ga = true, vercel = true } = options;

  if (ga) {
    trackGAEvent(eventName, properties);
  }

  if (vercel) {
    trackVercelEvent(eventName, properties);
  }
}

export function trackLeadConversion(
  eventName: AnalyticsEventName,
  properties: Record<string, unknown>,
): void {
  trackAnalyticsEvent(eventName, properties, { ga: true, vercel: false });
  trackGAEvent(ANALYTICS_EVENTS.generateLead, properties);
}

export function setAnalyticsConsent(granted: boolean): void {
  if (typeof window === "undefined") return;
  const state = granted ? "granted" : "denied";

  if (typeof window.setAnalyticsConsent === "function") {
    window.setAnalyticsConsent(granted);
    return;
  }

  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state,
    });
  }

  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, state);
  } catch (_error) {
    // Ignore storage errors in constrained environments.
  }

  window.dispatchEvent(
    new CustomEvent(ANALYTICS_CONSENT_EVENT, {
      detail: { granted },
    }),
  );
}
