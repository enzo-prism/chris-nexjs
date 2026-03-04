import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
} from "@shared/analytics";

export function trackGAEvent(action: string, params: Record<string, any> = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
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
