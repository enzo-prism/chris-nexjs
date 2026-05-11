export const ANALYTICS_CONSENT_STORAGE_KEY = "analytics_consent";
export const ANALYTICS_CONSENT_EVENT = "analytics-consent-updated";
export const ANALYTICS_EXCLUDED_PATHS = ["/analytics", "/ga-test"] as const;
const ANALYTICS_EVENT_NAME_MAX_LENGTH = 40;
const ANALYTICS_PROPERTY_KEY_MAX_LENGTH = 40;
const ANALYTICS_EVENT_VALUE_MAX_LENGTH = 100;
const VERCEL_CUSTOM_DATA_PROPERTY_LIMIT = 2;

export const ANALYTICS_EVENTS = {
  phoneCallClick: "phone_call_click",
  emailClick: "email_click",
  bookAppointmentClick: "book_appointment_click",
  outboundClick: "outbound_click",
  scheduleStart: "schedule_start",
  scheduleSubmitFailure: "schedule_submit_failure",
  contactFormSubmit: "contact_form_submit",
  newsletterSignup: "newsletter_signup",
  appointmentRequestSubmit: "appointment_request_submit",
  generateLead: "generate_lead",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS] | string;

export type AnalyticsPageCategory =
  | "home"
  | "schedule"
  | "service"
  | "location"
  | "blog"
  | "trust"
  | "legal"
  | "internal"
  | "other";

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

export function getAnalyticsPageCategory(pathname: string): AnalyticsPageCategory {
  const normalizedPath = normalizeAnalyticsPath(pathname);

  if (normalizedPath === "/") return "home";
  if (normalizedPath === "/schedule" || normalizedPath === "/zoom-whitening/schedule") {
    return "schedule";
  }
  if (isAnalyticsPathExcluded(normalizedPath)) return "internal";
  if (normalizedPath === "/blog" || normalizedPath.startsWith("/blog/")) {
    return "blog";
  }
  if (normalizedPath === "/locations" || normalizedPath.startsWith("/dentist-")) {
    return "location";
  }
  if (
    normalizedPath === "/privacy-policy" ||
    normalizedPath === "/terms" ||
    normalizedPath === "/hipaa" ||
    normalizedPath === "/accessibility"
  ) {
    return "legal";
  }
  if (
    normalizedPath === "/about" ||
    normalizedPath === "/testimonials" ||
    normalizedPath === "/patient-stories" ||
    normalizedPath === "/patient-resources" ||
    normalizedPath === "/gallery" ||
    normalizedPath === "/contact" ||
    normalizedPath === "/changelog"
  ) {
    return "trust";
  }
  if (
    normalizedPath === "/services" ||
    normalizedPath === "/preventive-dentistry" ||
    normalizedPath === "/restorative-dentistry" ||
    normalizedPath === "/pediatric-dentistry" ||
    normalizedPath === "/invisalign" ||
    normalizedPath === "/invisalign/resources" ||
    normalizedPath === "/emergency-dental" ||
    normalizedPath === "/zoom-whitening" ||
    normalizedPath === "/teeth-whitening-palo-alto" ||
    normalizedPath === "/dental-cleaning-palo-alto" ||
    normalizedPath === "/cavity-fillings-palo-alto" ||
    normalizedPath === "/crowns-palo-alto" ||
    normalizedPath === "/pediatric-dentist-palo-alto" ||
    normalizedPath === "/dental-implants" ||
    normalizedPath === "/dental-veneers"
  ) {
    return "service";
  }

  return "other";
}

export function getAnalyticsPageContext(pathname: string): {
  page_path: string;
  page_category: AnalyticsPageCategory;
} {
  const pagePath = normalizeAnalyticsPath(pathname);
  return {
    page_path: pagePath,
    page_category: getAnalyticsPageCategory(pagePath),
  };
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

export function getAnalyticsPageContextFromUrl(url: string | null | undefined): {
  page_path: string;
  page_category: AnalyticsPageCategory;
} | undefined {
  const pagePath = getAnalyticsPathFromUrl(url);
  return pagePath ? getAnalyticsPageContext(pagePath) : undefined;
}

export function isAnalyticsUrlExcluded(url: string | null | undefined): boolean {
  const path = getAnalyticsPathFromUrl(url);
  return path ? isAnalyticsPathExcluded(path) : false;
}

export function sanitizeAnalyticsEventName(name: string): string {
  const normalized = name
    .trim()
    .replace(/[^A-Za-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^([^A-Za-z])/, "event_$1")
    .replace(/_$/g, "")
    .slice(0, ANALYTICS_EVENT_NAME_MAX_LENGTH);

  return normalized || "event";
}

function sanitizeAnalyticsPropertyKey(key: string): string | null {
  const normalized = key
    .trim()
    .replace(/[^A-Za-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^([^A-Za-z])/, "param_$1")
    .replace(/_$/g, "")
    .slice(0, ANALYTICS_PROPERTY_KEY_MAX_LENGTH);

  if (!normalized) return null;

  const lowerKey = normalized.toLowerCase();
  if (
    lowerKey.startsWith("_") ||
    lowerKey.startsWith("firebase_") ||
    lowerKey.startsWith("ga_") ||
    lowerKey.startsWith("google_") ||
    lowerKey.startsWith("gtag_")
  ) {
    return null;
  }

  return normalized;
}

function isUnsafeAnalyticsProperty(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return (
    lowerKey.includes("email") ||
    lowerKey.includes("phone") ||
    lowerKey.includes("message") ||
    lowerKey.includes("url") ||
    lowerKey.includes("note") ||
    lowerKey === "full_name" ||
    lowerKey === "fullname" ||
    lowerKey === "first_name" ||
    lowerKey === "firstname" ||
    lowerKey === "last_name" ||
    lowerKey === "lastname"
  );
}

function sanitizeAnalyticsPropertyValue(
  value: unknown,
): AnalyticsEventPropertyValue | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, ANALYTICS_EVENT_VALUE_MAX_LENGTH);
}

export function sanitizeAnalyticsEventProperties(
  properties: Record<string, unknown>,
): Record<string, AnalyticsEventPropertyValue> | undefined {
  const sanitizedEntries = Object.entries(properties).flatMap(([rawKey, rawValue]) => {
    const key = sanitizeAnalyticsPropertyKey(rawKey);
    if (!key || isUnsafeAnalyticsProperty(key)) {
      return [];
    }

    const value = sanitizeAnalyticsPropertyValue(rawValue);
    if (value !== undefined) {
      return [[key, value]];
    }

    return [];
  });

  if (sanitizedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(sanitizedEntries);
}

const VERCEL_EVENT_PROPERTY_PRIORITY: Record<string, readonly string[]> = {
  [ANALYTICS_EVENTS.phoneCallClick]: ["page_path", "page_category"],
  [ANALYTICS_EVENTS.emailClick]: ["page_path", "page_category"],
  [ANALYTICS_EVENTS.bookAppointmentClick]: ["page_path", "cta_context"],
  [ANALYTICS_EVENTS.outboundClick]: ["page_path", "destination_host"],
  [ANALYTICS_EVENTS.scheduleStart]: ["page_path", "scheduling_mode"],
  [ANALYTICS_EVENTS.scheduleSubmitFailure]: ["page_path", "reason"],
  [ANALYTICS_EVENTS.contactFormSubmit]: ["page_path", "lead_type"],
  [ANALYTICS_EVENTS.newsletterSignup]: ["page_path", "lead_type"],
  [ANALYTICS_EVENTS.appointmentRequestSubmit]: ["page_path", "appointment_type"],
};

const DEFAULT_VERCEL_PROPERTY_PRIORITY = [
  "page_path",
  "page_category",
  "lead_type",
  "cta_context",
  "destination_host",
] as const;

export function sanitizeVercelEventProperties(
  eventName: AnalyticsEventName,
  properties: Record<string, unknown>,
): Record<string, AnalyticsEventPropertyValue> | undefined {
  const safeProperties = sanitizeAnalyticsEventProperties(properties);
  if (!safeProperties) return undefined;

  const priority =
    VERCEL_EVENT_PROPERTY_PRIORITY[sanitizeAnalyticsEventName(eventName)] ??
    DEFAULT_VERCEL_PROPERTY_PRIORITY;
  const selectedEntries: Array<[string, AnalyticsEventPropertyValue]> = [];

  for (const key of priority) {
    if (
      Object.prototype.hasOwnProperty.call(safeProperties, key) &&
      selectedEntries.length < VERCEL_CUSTOM_DATA_PROPERTY_LIMIT
    ) {
      selectedEntries.push([key, safeProperties[key]]);
    }
  }

  if (selectedEntries.length === 0) return undefined;
  return Object.fromEntries(selectedEntries);
}
