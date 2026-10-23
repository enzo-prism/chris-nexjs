const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 8;

const hitsByIp = new Map<string, number[]>();

export const SCHEDULE_REQUEST_RATE_LIMIT = {
  windowMs: WINDOW_MS,
  maxHits: MAX_HITS,
} as const;

const IPV4 =
  /^(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const IPV6 = /^[0-9a-f:.]{2,}$/i;

export function isUsableClientIp(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "unknown") {
    return false;
  }
  return IPV4.test(trimmed) || (trimmed.includes(":") && IPV6.test(trimmed));
}

export function getTrustedClientIp(headers: Headers): string | null {
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp && isUsableClientIp(realIp)) {
    return realIp;
  }

  const vercelForwarded = headers.get("x-vercel-forwarded-for")?.trim();
  if (vercelForwarded) {
    const hops = vercelForwarded
      .split(",")
      .map((hop) => hop.trim())
      .filter(Boolean);
    const trustedHop = hops.at(-1);
    if (trustedHop && isUsableClientIp(trustedHop)) {
      return trustedHop;
    }
  }

  return null;
}

function evictExpiredKeys(now: number): void {
  const cutoff = now - WINDOW_MS;
  for (const [ip, stamps] of hitsByIp) {
    const live = stamps.filter((stamp) => stamp > cutoff);
    if (live.length === 0) {
      hitsByIp.delete(ip);
    } else if (live.length !== stamps.length) {
      hitsByIp.set(ip, live);
    }
  }
}

export function consumeScheduleRequestSlot(
  ip: string | null,
  now = Date.now(),
): { readonly allowed: boolean; readonly retryAfterSeconds: number } {
  evictExpiredKeys(now);

  if (!ip || !isUsableClientIp(ip)) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const cutoff = now - WINDOW_MS;
  const prior = (hitsByIp.get(ip) ?? []).filter((stamp) => stamp > cutoff);

  if (prior.length >= MAX_HITS) {
    hitsByIp.set(ip, prior);
    const retryAfterMs = Math.max(prior[0] + WINDOW_MS - now, 1_000);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  prior.push(now);
  hitsByIp.set(ip, prior);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetScheduleRequestRateLimitForTests(): void {
  hitsByIp.clear();
}

export function inspectScheduleRequestRateLimitForTests(): ReadonlyMap<string, number[]> {
  return hitsByIp;
}
