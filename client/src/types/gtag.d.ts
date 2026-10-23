// Type definitions for Google Analytics gtag
interface Window {
  dataLayer?: unknown[];
  gtag?: (
    command: string,
    action: string | Date,
    params?: Record<string, any>
  ) => void;
  setAnalyticsConsent?: (granted: boolean) => void;
  __cwScheduleOutcomes?: Array<{
    submitted: boolean;
    success: boolean;
    leadFired: boolean;
    formName: string;
  }>;
}
