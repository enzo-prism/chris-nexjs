import "server-only";

import { getOfficeTodayISO, officeInfo } from "./officeInfo";
import {
  fallbackGoogleReviewStats,
  GOOGLE_REVIEW_COUNT,
  MAX_GOOGLE_REVIEW_COUNT,
  PUBLISHED_REVIEW_COUNT,
  PUBLISHED_REVIEW_RATING,
  REVIEW_STATS_LAST_UPDATED,
  type GoogleReviewStats,
  type PublishedReviewStats,
} from "./reviewStats";

export type { GoogleReviewStats, PublishedReviewStats, ReviewStatsSource } from "./reviewStats";

export const GOOGLE_PLACES_API_KEY_ENV = "GOOGLE_PLACES_API_KEY";
export const GOOGLE_PLACE_ID_ENV = "GOOGLE_PLACE_ID";

/** Places API (New) field mask. Never request `reviews` or other PII fields. */
export const GOOGLE_PLACES_FIELD_MASK = "rating,userRatingCount";

/** Daily window for a successful live Places read. */
export const GOOGLE_REVIEW_STATS_REVALIDATE_SECONDS = 86_400;

/** Short process-local window after a Places miss so SSR does not re-hang. */
export const GOOGLE_REVIEW_STATS_NEGATIVE_REVALIDATE_SECONDS = 300;

/** Abort a hung Places request so SSR/build cannot stall. */
export const GOOGLE_PLACES_FETCH_TIMEOUT_MS = 4_000;

export function googleReviewStatsCacheKey(placeId: string): string[] {
  return ["google-place-review-stats", placeId];
}

export function googleReviewStatsNegativeCacheKey(placeId: string): string[] {
  return ["google-place-review-stats-miss", placeId];
}

function negativeCacheStorageKey(placeId: string): string {
  return googleReviewStatsNegativeCacheKey(placeId).join(":");
}

const negativeCacheUntil = new Map<string, number>();

export function readGoogleReviewStatsNegativeCache(
  placeId: string,
  nowMs: number = Date.now(),
): boolean {
  const storageKey = negativeCacheStorageKey(placeId);
  const expiresAt = negativeCacheUntil.get(storageKey);
  if (expiresAt === undefined) return false;
  if (expiresAt <= nowMs) {
    negativeCacheUntil.delete(storageKey);
    return false;
  }
  return true;
}

export function writeGoogleReviewStatsNegativeCache(
  placeId: string,
  nowMs: number = Date.now(),
): void {
  negativeCacheUntil.set(
    negativeCacheStorageKey(placeId),
    nowMs + GOOGLE_REVIEW_STATS_NEGATIVE_REVALIDATE_SECONDS * 1_000,
  );
}

export function clearGoogleReviewStatsNegativeCache(): void {
  negativeCacheUntil.clear();
}

type PlacesLiveFields = {
  readonly ratingValue: unknown;
  readonly reviewCount: unknown;
};

export function defaultGooglePlaceId(): string {
  const fromEnv = process.env[GOOGLE_PLACE_ID_ENV]?.trim();
  if (fromEnv) return fromEnv;
  return officeInfo.googlePlaceId;
}

export function readGooglePlacesApiKey(
  env: Record<string, string | undefined> = process.env,
): string | null {
  const key = env[GOOGLE_PLACES_API_KEY_ENV]?.trim();
  return key ? key : null;
}

export function isUsableReviewCount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= GOOGLE_REVIEW_COUNT &&
    value <= MAX_GOOGLE_REVIEW_COUNT
  );
}

export function isUsableRating(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 5;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

/**
 * Accept Places API (New) `{ rating, userRatingCount }` and legacy Place
 * Details `{ result: { rating, user_ratings_total } }`.
 */
export function parsePlacesReviewFields(payload: unknown): PlacesLiveFields | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const result =
    record.result && typeof record.result === "object"
      ? (record.result as Record<string, unknown>)
      : null;

  const ratingValue = record.rating ?? result?.rating;
  const reviewCount =
    record.userRatingCount ?? result?.user_ratings_total ?? record.user_ratings_total;

  if (ratingValue === undefined && reviewCount === undefined) return null;
  return { ratingValue, reviewCount };
}

export function fallbackGoogleReviewSnapshot(
  lastUpdated: string = REVIEW_STATS_LAST_UPDATED,
): GoogleReviewStats {
  return {
    ratingValue: fallbackGoogleReviewStats.ratingValue,
    reviewCount: fallbackGoogleReviewStats.reviewCount,
    lastUpdated,
    source: "fallback",
  };
}

export function resolveGoogleReviewStats(input: {
  readonly live?: PlacesLiveFields | null;
  readonly now?: Date;
}): GoogleReviewStats {
  const fallback = fallbackGoogleReviewSnapshot();
  const live = input.live;
  if (!live) return fallback;

  const ratingValue = asFiniteNumber(live.ratingValue);
  if (!isUsableRating(ratingValue) || !isUsableReviewCount(live.reviewCount)) {
    return fallback;
  }

  const now = input.now ?? new Date();
  return {
    ratingValue,
    reviewCount: live.reviewCount,
    lastUpdated: getOfficeTodayISO(now),
    source: "live",
  };
}

export function withPublishedReviewCount(stats: GoogleReviewStats): PublishedReviewStats {
  return {
    ...stats,
    publishedReviewCount: PUBLISHED_REVIEW_COUNT,
  };
}

export function displayedAggregateRating(stats: GoogleReviewStats): {
  readonly ratingValue: number;
  readonly reviewCount: number;
} {
  return {
    ratingValue: stats.ratingValue,
    reviewCount: stats.reviewCount,
  };
}

export function placesDetailsUrl(placeId: string): string {
  return `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
}

export type LoadGoogleReviewStatsOptions = {
  readonly apiKey?: string | null;
  readonly placeId?: string | null;
  readonly fetchImpl?: typeof fetch;
  readonly now?: Date;
  readonly timeoutMs?: number;
};

/**
 * Server-safe loader. Missing credentials, timeouts, network errors, non-OK
 * responses, and unusable payloads (0, blank, out of range) all return the
 * committed fallback. Never returns a 0 or empty count.
 */
export async function loadGoogleReviewStats(
  options: LoadGoogleReviewStatsOptions = {},
): Promise<GoogleReviewStats> {
  const apiKey = options.apiKey === undefined ? readGooglePlacesApiKey() : options.apiKey;
  const placeId = (options.placeId ?? defaultGooglePlaceId()).trim();
  if (!apiKey || !placeId) {
    return fallbackGoogleReviewSnapshot();
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? GOOGLE_PLACES_FETCH_TIMEOUT_MS;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        const response = await fetchImpl(placesDetailsUrl(placeId), {
          method: "GET",
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASK,
            Accept: "application/json",
          },
          // Cache only the validated snapshot in the server wrapper. Next's
          // fetch cache must not retain an invalid response independently.
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          return fallbackGoogleReviewSnapshot();
        }
        const payload: unknown = await response.json();
        return resolveGoogleReviewStats({
          live: parsePlacesReviewFields(payload),
          now: options.now,
        });
      })(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error("Places request timed out"));
        }, timeoutMs);
      }),
    ]);
  } catch {
    return fallbackGoogleReviewSnapshot();
  } finally {
    clearTimeout(timer);
  }
}

export function assertUsableGoogleReviewStats(stats: GoogleReviewStats): GoogleReviewStats {
  if (!isUsableRating(stats.ratingValue) || !isUsableReviewCount(stats.reviewCount)) {
    return fallbackGoogleReviewSnapshot();
  }
  return stats;
}

export type ResolveGoogleReviewStatsDeps = {
  readonly apiKey?: string | null;
  readonly placeId?: string;
  readonly load?: (options: LoadGoogleReviewStatsOptions) => Promise<GoogleReviewStats>;
  readonly readLiveCache?: (placeId: string) => Promise<GoogleReviewStats | null>;
  readonly writeLiveCache?: (placeId: string, stats: GoogleReviewStats) => Promise<void> | void;
  readonly readNegativeCache?: (placeId: string) => Promise<boolean> | boolean;
  readonly writeNegativeCache?: (placeId: string) => Promise<void> | void;
  readonly now?: Date;
};

/**
 * Resolve live-or-fallback stats. Only successful live snapshots are written
 * to the 24h cache. Misses go to a short negative cache so the next request
 * does not re-hit Places; fallback is never stored as live data.
 */
export async function getResolvedGoogleReviewStats(
  deps: ResolveGoogleReviewStatsDeps = {},
): Promise<PublishedReviewStats> {
  const placeId = (deps.placeId ?? defaultGooglePlaceId()).trim();
  const apiKey = deps.apiKey === undefined ? readGooglePlacesApiKey() : deps.apiKey;
  const load = deps.load ?? loadGoogleReviewStats;
  const readNegative = deps.readNegativeCache ?? readGoogleReviewStatsNegativeCache;
  const writeNegative = deps.writeNegativeCache ?? writeGoogleReviewStatsNegativeCache;

  if (!apiKey || !placeId) {
    return withPublishedReviewCount(fallbackGoogleReviewSnapshot());
  }

  const cached = deps.readLiveCache ? await deps.readLiveCache(placeId) : null;
  if (cached?.source === "live") {
    return withPublishedReviewCount(assertUsableGoogleReviewStats(cached));
  }

  if (await readNegative(placeId)) {
    return withPublishedReviewCount(fallbackGoogleReviewSnapshot());
  }

  const stats = assertUsableGoogleReviewStats(
    await load({ apiKey, placeId, now: deps.now }),
  );
  if (stats.source === "live" && deps.writeLiveCache) {
    await deps.writeLiveCache(placeId, stats);
  } else if (stats.source === "fallback") {
    await writeNegative(placeId);
  }
  return withPublishedReviewCount(stats);
}

export const committedGoogleReviewCopy = {
  googleReviewCount: GOOGLE_REVIEW_COUNT,
  publishedReviewCount: PUBLISHED_REVIEW_COUNT,
  ratingValue: PUBLISHED_REVIEW_RATING,
  lastUpdated: REVIEW_STATS_LAST_UPDATED,
} as const;
