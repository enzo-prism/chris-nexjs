import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
  type AnalyticsConsentState,
} from "@shared/analytics";

const FALLBACK_GA_ALLOWED_HOSTS = new Set([
  "www.chriswongdds.com",
  "chriswongdds.com",
  "chris-nextjs.vercel.app",
  "chriswongdds.vercel.app",
]);

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

export function trackGAEvent(action: string, params: Record<string, any> = {}): void {
  if (
    typeof window === "undefined" ||
    typeof window.gtag !== "function" ||
    !isAnalyticsRuntimeEnabled() ||
    !hasAnalyticsConsent()
  ) {
    return;
  }

  window.gtag("event", action, params);
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
