import {
  deriveLeadChannel,
  isLeadChannel,
  pickUtmParams,
  type LeadAttribution,
} from "@shared/attribution";
import { hasAnalyticsConsent } from "@/lib/analytics";

// Remembers how a visitor first arrived so a lead submitted pages later (for
// example Google Business Profile → homepage → /schedule) still carries its
// source. Stored first-party in localStorage for 30 days; no identifiers.

const STORAGE_KEY = "cw_lead_attribution_v1";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CLICK_ID_KEYS = ["gclid", "gbraid", "wbraid"] as const;

type StoredTouch = LeadAttribution & {
  readonly utm: Record<string, string>;
  readonly capturedAt: number;
};

export type LeadAttributionSnapshot = {
  readonly attribution: LeadAttribution;
  readonly utm: Record<string, string>;
};

declare global {
  interface Window {
    // Set by the inline bootstrap in app/layout.tsx on first paint.
    __cwEntry?: { readonly href: string; readonly referrer: string };
  }
}

let capturedThisDocument = false;

// The URL the visitor actually landed on. The analytics component mounts
// after hydration, by which time a fast visitor may already have navigated
// client-side (e.g. / → /schedule), dropping the landing page's utm tags.
const getEntry = (): { url: URL; referrer: string } => {
  const entry = window.__cwEntry;
  try {
    if (entry?.href) return { url: new URL(entry.href), referrer: entry.referrer };
  } catch {
    // Fall through to the current location.
  }
  return { url: new URL(window.location.href), referrer: document.referrer };
};

const getExternalReferrerHost = (referrer: string): string | undefined => {
  if (!referrer) return undefined;
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    const ownHost = window.location.hostname.toLowerCase().replace(/^www\./, "");
    if (host.replace(/^www\./, "") === ownHost) return undefined;
    return host.slice(0, 120);
  } catch {
    return undefined;
  }
};

const readStoredTouch = (): StoredTouch | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Record<keyof StoredTouch, unknown>>;
    if (!isLeadChannel(parsed.channel) || typeof parsed.capturedAt !== "number") {
      return null;
    }
    if (Date.now() - parsed.capturedAt > TTL_MS) return null;
    const text = (value: unknown, max: number): string | undefined =>
      typeof value === "string" && value.length > 0 ? value.slice(0, max) : undefined;
    const landingPath = text(parsed.landingPath, 200);
    const referrerHost = text(parsed.referrerHost, 120);
    const utm =
      parsed.utm && typeof parsed.utm === "object"
        ? pickUtmParams(parsed.utm as Record<string, string | undefined>)
        : {};
    return {
      channel: parsed.channel,
      ...(landingPath ? { landingPath } : {}),
      ...(referrerHost ? { referrerHost } : {}),
      utm,
      capturedAt: parsed.capturedAt,
    };
  } catch {
    return null;
  }
};

const buildEntryTouch = (): StoredTouch => {
  const { url, referrer } = getEntry();
  const utm = pickUtmParams(url.searchParams);
  const referrerHost = getExternalReferrerHost(referrer);
  const hasClickId = CLICK_ID_KEYS.some((key) => url.searchParams.has(key));
  return {
    channel: deriveLeadChannel({ utm, referrerHost, hasClickId }),
    landingPath: url.pathname.slice(0, 200) || "/",
    ...(referrerHost ? { referrerHost } : {}),
    utm,
    capturedAt: Date.now(),
  };
};

/**
 * Record the visit's source once per page load. A tagged or referred visit
 * replaces the stored touch (last non-direct touch wins); a plain direct visit
 * only fills an empty slot so it never erases a known source.
 */
export function captureLeadAttribution(): void {
  if (typeof window === "undefined" || capturedThisDocument) return;
  capturedThisDocument = true;
  if (!hasAnalyticsConsent()) return;

  const current = buildEntryTouch();
  const stored = readStoredTouch();
  if (current.channel === "direct" && stored) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
  }
}

export function getLeadAttribution(): LeadAttributionSnapshot | null {
  if (typeof window === "undefined") return null;
  const touch = readStoredTouch() ?? buildEntryTouch();
  const { utm, capturedAt: _capturedAt, ...attribution } = touch;
  return { attribution, utm };
}
