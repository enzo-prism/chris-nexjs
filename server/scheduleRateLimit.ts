const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 8;

const hitsByIp = new Map<string, number[]>();

export const SCHEDULE_REQUEST_RATE_LIMIT = {
  windowMs: WINDOW_MS,
  maxHits: MAX_HITS,
} as const;

export function consumeScheduleRequestSlot(
  ip: string,
  now = Date.now(),
): boolean {
  const key = ip.trim() || "unknown";
  const cutoff = now - WINDOW_MS;
  const prior = (hitsByIp.get(key) ?? []).filter((stamp) => stamp > cutoff);

  if (prior.length >= MAX_HITS) {
    hitsByIp.set(key, prior);
    return false;
  }

  prior.push(now);
  hitsByIp.set(key, prior);
  return true;
}

export function resetScheduleRequestRateLimitForTests(): void {
  hitsByIp.clear();
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return (
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-vercel-forwarded-for")?.trim() ||
    "unknown"
  );
}
