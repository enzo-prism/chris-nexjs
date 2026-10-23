export const SCHEDULE_REQUEST_TIMEOUT_MS = 15_000;

export const ALLOWED_SCHEDULE_SOURCES = [
  "schedule_page_form_v2",
  "schedule_page_form_v1",
  "schedule_page_form",
  "invisalign_consult",
] as const;

export type AllowedScheduleSource = (typeof ALLOWED_SCHEDULE_SOURCES)[number];

export const CANONICAL_SOURCE_URL_HOSTS = new Set([
  "chriswongdds.com",
  "www.chriswongdds.com",
]);

export const LIVE_VERCEL_HOST = "chris-wong-dds.vercel.app";
export const VERCEL_PROJECT_NAME = "chris-wong-dds";
export const VERCEL_TEAM_SLUG = "enzo-design-prisms-projects";

const LOCAL_SOURCE_URL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

const VERCEL_HOST_ENV_KEYS = [
  "VERCEL_URL",
  "VERCEL_BRANCH_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
] as const;

export type ScheduleSourceHostKind = "production" | "preview";

export type ScheduleSourcePolicy = {
  readonly allowLocalhost: boolean;
  readonly requireSource: boolean;
  readonly requireSourceUrl: boolean;
};

export type ScheduleRequestClientResult =
  | { readonly accepted: true; readonly neutral: false }
  | { readonly accepted: false; readonly neutral: true }
  | { readonly accepted: false; readonly neutral: false; readonly message: string };

export type ScheduleSubmitPlan = {
  readonly emitLead: boolean;
  readonly emitSuccessEvents: boolean;
  readonly showConfirmation: boolean;
  readonly showError: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export class ScheduleSubmitError extends Error {
  readonly status: number;
  readonly retryAfterSeconds: number | null;

  constructor(
    message: string,
    options: { readonly status: number; readonly retryAfterSeconds?: number | null },
  ) {
    super(message);
    this.name = "ScheduleSubmitError";
    this.status = options.status;
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
  }
}

export function resolveScheduleSourcePolicy(
  env: NodeJS.Dict<string | undefined> = process.env,
): ScheduleSourcePolicy {
  const vercelEnv = env.VERCEL_ENV?.trim() ?? "";
  const deployed = vercelEnv === "production" || vercelEnv === "preview";

  return {
    allowLocalhost: !deployed,
    requireSource: deployed,
    requireSourceUrl: deployed,
  };
}

export function hostnameFromEnvUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) {
    return null;
  }

  try {
    const parsed = value.includes("://") ? new URL(value) : new URL(`https://${value}`);
    return parsed.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function vercelDeploymentHosts(
  env: NodeJS.Dict<string | undefined> = process.env,
): ReadonlySet<string> {
  const hosts = new Set<string>();
  for (const key of VERCEL_HOST_ENV_KEYS) {
    const host = hostnameFromEnvUrl(env[key]);
    if (host) {
      hosts.add(host);
    }
  }
  return hosts;
}

export function isThisProjectVercelHost(
  host: string,
  env: NodeJS.Dict<string | undefined> = process.env,
): boolean {
  const normalized = host.toLowerCase();
  if (normalized === LIVE_VERCEL_HOST) {
    return true;
  }
  if (vercelDeploymentHosts(env).has(normalized)) {
    return true;
  }
  if (!normalized.endsWith(".vercel.app")) {
    return false;
  }

  const previewSuffix = `-${VERCEL_TEAM_SLUG}.vercel.app`;
  return (
    normalized.endsWith(previewSuffix) &&
    normalized.startsWith(`${VERCEL_PROJECT_NAME}-`)
  );
}

export function classifySourceHostKind(
  sourceUrl: string,
  env: NodeJS.Dict<string | undefined> = process.env,
): ScheduleSourceHostKind | null {
  try {
    const host = new URL(sourceUrl).hostname.toLowerCase();
    if (CANONICAL_SOURCE_URL_HOSTS.has(host) || host === LIVE_VERCEL_HOST) {
      return "production";
    }
    if (isThisProjectVercelHost(host, env)) {
      return "preview";
    }
    return null;
  } catch {
    return null;
  }
}

export function isAllowedScheduleSource(
  source: string | null | undefined,
  policy: ScheduleSourcePolicy = resolveScheduleSourcePolicy(),
): boolean {
  const trimmed = source?.trim() ?? "";
  if (!trimmed) {
    return !policy.requireSource;
  }

  return (ALLOWED_SCHEDULE_SOURCES as readonly string[]).includes(trimmed);
}

export function isAllowedScheduleSourceUrl(
  sourceUrl: string | null | undefined,
  policy: ScheduleSourcePolicy = resolveScheduleSourcePolicy(),
  env: NodeJS.Dict<string | undefined> = process.env,
): boolean {
  const trimmed = sourceUrl?.trim() ?? "";
  if (!trimmed) {
    return !policy.requireSourceUrl;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    if (parsed.username || parsed.password) {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    if (LOCAL_SOURCE_URL_HOSTS.has(host)) {
      return policy.allowLocalhost;
    }
    if (CANONICAL_SOURCE_URL_HOSTS.has(host) || host === LIVE_VERCEL_HOST) {
      return true;
    }
    return isThisProjectVercelHost(host, env);
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

export function planScheduleSubmitAnalytics(
  result: ScheduleRequestClientResult,
): ScheduleSubmitPlan {
  if (result.accepted) {
    return {
      emitLead: true,
      emitSuccessEvents: true,
      showConfirmation: true,
      showError: false,
    };
  }

  if (result.neutral) {
    return {
      emitLead: false,
      emitSuccessEvents: false,
      showConfirmation: true,
      showError: false,
    };
  }

  return {
    emitLead: false,
    emitSuccessEvents: false,
    showConfirmation: false,
    showError: true,
  };
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

export function parseRetryAfterSeconds(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const seconds = Number.parseInt(value, 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}
