// Type definitions for Google Analytics gtag
interface Window {
  dataLayer?: unknown[];
  gtag: (
    command: string,
    action: string | Date,
    params?: Record<string, any>
  ) => void;
}
