import { officeInfo } from "./officeInfo";
import {
  fallbackGoogleReviewStats,
  GOOGLE_REVIEW_COUNT,
  PUBLISHED_REVIEW_COUNT,
  PUBLISHED_REVIEW_RATING,
  REVIEW_STATS_LAST_UPDATED,
  type GoogleReviewStats,
  type PublishedReviewStats,
} from "./reviewStats";

export type { GoogleReviewStats, PublishedReviewStats, ReviewStatsSource } from "./reviewStats";

export const GOOGLE_PLACES_API_KEY_ENV = "GOOGLE_PLACES_API_KEY";
export const GOOGLE_PLACE_ID_ENV = "GOOGLE_PLACE_ID";

/** Daily ISR window for a live Places read. */
export const GOOGLE_REVIEW_STATS_REVALIDATE_SECONDS = 86_400;

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
  return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value) && value > 0;
}

export function isUsableRating(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 5;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
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

  const ratingValue = asFiniteNumber(record.rating ?? result?.rating);
  const reviewCount = asFiniteNumber(
    record.userRatingCount ?? result?.user_ratings_total ?? record.user_ratings_total,
  );

  if (ratingValue === null && reviewCount === null) return null;
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
  const reviewCount = asFiniteNumber(live.reviewCount);
  if (!isUsableRating(ratingValue) || !isUsableReviewCount(reviewCount)) {
    return fallback;
  }

  const now = input.now ?? new Date();
  return {
    ratingValue,
    reviewCount,
    lastUpdated: now.toISOString().slice(0, 10),
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
};

/**
 * Server-safe loader. Missing credentials, network errors, non-OK responses,
 * and unusable payloads (0, blank, out of range) all return the committed
 * fallback. Never returns a 0 or empty count.
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
  try {
    const response = await fetchImpl(placesDetailsUrl(placeId), {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount",
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      return fallbackGoogleReviewSnapshot();
    }
    const payload: unknown = await response.json();
    return resolveGoogleReviewStats({
      live: parsePlacesReviewFields(payload),
      now: options.now,
    });
  } catch {
    return fallbackGoogleReviewSnapshot();
  }
}

export function assertUsableGoogleReviewStats(stats: GoogleReviewStats): GoogleReviewStats {
  if (!isUsableRating(stats.ratingValue) || !isUsableReviewCount(stats.reviewCount)) {
    return fallbackGoogleReviewSnapshot();
  }
  return stats;
}

export const committedGoogleReviewCopy = {
  googleReviewCount: GOOGLE_REVIEW_COUNT,
  publishedReviewCount: PUBLISHED_REVIEW_COUNT,
  ratingValue: PUBLISHED_REVIEW_RATING,
  lastUpdated: REVIEW_STATS_LAST_UPDATED,
} as const;
