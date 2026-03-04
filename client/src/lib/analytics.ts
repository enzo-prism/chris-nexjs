export function trackGAEvent(action: string, params: Record<string, any> = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", action, params);
}

export function setAnalyticsConsent(granted: boolean): void {
  if (typeof window === "undefined") return;
  if (typeof window.setAnalyticsConsent === "function") {
    window.setAnalyticsConsent(granted);
    return;
  }

  if (typeof window.gtag === "function") {
    const state = granted ? "granted" : "denied";
    window.gtag("consent", "update", {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state,
    });
  }
}
