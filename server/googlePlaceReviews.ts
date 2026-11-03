import "server-only";

import { unstable_cache } from "next/cache";
import {
  assertUsableGoogleReviewStats,
  defaultGooglePlaceId,
  fallbackGoogleReviewSnapshot,
  getResolvedGoogleReviewStats,
  googleReviewStatsCacheKey,
  GOOGLE_REVIEW_STATS_REVALIDATE_SECONDS,
  loadGoogleReviewStats,
  readGooglePlacesApiKey,
  readGoogleReviewStatsNegativeCache,
  type ResolveGoogleReviewStatsDeps,
  withPublishedReviewCount,
  writeGoogleReviewStatsNegativeCache,
  type GoogleReviewStats,
  type PublishedReviewStats,
} from "@shared/googlePlaceReviews";

async function fetchLiveOrThrow(): Promise<GoogleReviewStats> {
  const stats = assertUsableGoogleReviewStats(await loadGoogleReviewStats());
  if (stats.source !== "live") {
    throw new Error("google-review-stats-not-live");
  }
  return stats;
}

/**
 * Daily-cached Google review totals. Only successful live reads enter the
 * 24h cache (keyed by place ID). Timeouts, missing keys, and unusable
 * payloads return the committed fallback. Misses are remembered for five
 * minutes in a separate process-local cache so the next request does not
 * re-hit Places; fallback is never stored as live data.
 */
export async function getGoogleReviewStats(
  deps?: ResolveGoogleReviewStatsDeps,
): Promise<PublishedReviewStats> {
  if (deps) {
    return getResolvedGoogleReviewStats(deps);
  }

  const placeId = defaultGooglePlaceId();
  if (!readGooglePlacesApiKey() || !placeId) {
    return withPublishedReviewCount(fallbackGoogleReviewSnapshot());
  }

  if (readGoogleReviewStatsNegativeCache(placeId)) {
    return withPublishedReviewCount(fallbackGoogleReviewSnapshot());
  }

  try {
    const live = await unstable_cache(fetchLiveOrThrow, googleReviewStatsCacheKey(placeId), {
      revalidate: GOOGLE_REVIEW_STATS_REVALIDATE_SECONDS,
      tags: ["google-review-stats"],
    })();
    return withPublishedReviewCount(assertUsableGoogleReviewStats(live));
  } catch {
    writeGoogleReviewStatsNegativeCache(placeId);
    return withPublishedReviewCount(fallbackGoogleReviewSnapshot());
  }
}
