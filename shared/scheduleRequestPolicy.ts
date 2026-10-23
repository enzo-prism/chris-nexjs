export const SCHEDULE_REQUEST_TIMEOUT_MS = 15_000;

export const ALLOWED_SCHEDULE_SOURCES = [
  "schedule_page_form_v2",
  "schedule_page_form_v1",
  "schedule_page_form",
  "invisalign_consult",
] as const;

export type AllowedScheduleSource = (typeof ALLOWED_SCHEDULE_SOURCES)[number];

const PRODUCTION_SOURCE_URL_HOSTS = new Set(["chriswongdds.com", "www.chriswongdds.com"]);
const LOCAL_SOURCE_URL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export function isAllowedScheduleSource(source: string | null | undefined): boolean {
  if (!source || source.trim().length === 0) {
    return true;
  }

  return (ALLOWED_SCHEDULE_SOURCES as readonly string[]).includes(source.trim());
}

export function isAllowedScheduleSourceUrl(sourceUrl: string | null | undefined): boolean {
  if (!sourceUrl || sourceUrl.trim().length === 0) {
    return true;
  }

  try {
    const parsed = new URL(sourceUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    return PRODUCTION_SOURCE_URL_HOSTS.has(host) || LOCAL_SOURCE_URL_HOSTS.has(host);
  } catch {
    return false;
  }
}

/**
 * Success for inbox + client lead firing: a JSON object with an explicit
 * `ok: true` or `success: true`. `{success:false}`, HTML, and non-JSON are
 * failures. `accepted: false` is a honeypot/neutral ack, not a lead.
 */
export function isExplicitSuccessBody(body: unknown): boolean {
  if (!isRecord(body)) {
    return false;
  }

  if (body.accepted === false || body.lead === false) {
    return false;
  }

  return body.success === true || body.ok === true;
}

export function isNeutralScheduleAck(body: unknown): boolean {
  return isRecord(body) && body.accepted === false;
}

export type ScheduleRequestClientResult =
  | { readonly accepted: true; readonly neutral: false }
  | { readonly accepted: false; readonly neutral: true }
  | { readonly accepted: false; readonly neutral: false; readonly message: string };

const DEFAULT_FAILURE_MESSAGE =
  "We couldn’t send your request. Your answers are still here—please try again.";

const readMessage = (body: unknown): string => {
  if (isRecord(body) && typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }
  return DEFAULT_FAILURE_MESSAGE;
};

export function readScheduleRequestResult(
  status: number,
  body: unknown,
): ScheduleRequestClientResult {
  const okStatus = status >= 200 && status < 300;

  if (!okStatus) {
    return { accepted: false, neutral: false, message: readMessage(body) };
  }

  if (!isRecord(body)) {
    return { accepted: false, neutral: false, message: DEFAULT_FAILURE_MESSAGE };
  }

  if (body.success === false) {
    return { accepted: false, neutral: false, message: readMessage(body) };
  }

  if (isNeutralScheduleAck(body)) {
    return { accepted: false, neutral: true };
  }

  if (isExplicitSuccessBody(body)) {
    return { accepted: true, neutral: false };
  }

  return { accepted: false, neutral: false, message: DEFAULT_FAILURE_MESSAGE };
}

export function parseJsonBody(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return text;
  }
}
