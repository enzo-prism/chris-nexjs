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

export class GoogleReviewStatsRecentMissError extends Error {
  override readonly name = "GoogleReviewStatsRecentMissError";

  constructor() {
    super("google-review-stats-recent-miss");
  }
}

async function fetchLiveOrThrow(): Promise<GoogleReviewStats> {
  const placeId = defaultGooglePlaceId();
  if (readGoogleReviewStatsNegativeCache(placeId)) {
    throw new GoogleReviewStatsRecentMissError();
  }
  const stats = assertUsableGoogleReviewStats(await loadGoogleReviewStats());
  if (stats.source !== "live") {
    throw new Error("google-review-stats-not-live");
  }
  return stats;
}

/**
 * Daily-cached Google review totals. The 24h `unstable_cache` is consulted
 * first so a cached live snapshot wins over a process-local miss. Only a
 * successful live read is stored there (the callback throws on fallback).
 * A Places failure is remembered for five minutes from that failure; later
 * requests in the window return fallback without extending the expiry.
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

  try {
    const live = await unstable_cache(fetchLiveOrThrow, googleReviewStatsCacheKey(placeId), {
      revalidate: GOOGLE_REVIEW_STATS_REVALIDATE_SECONDS,
      tags: ["google-review-stats"],
    })();
    return withPublishedReviewCount(assertUsableGoogleReviewStats(live));
  } catch (error) {
    if (!(error instanceof GoogleReviewStatsRecentMissError)) {
      writeGoogleReviewStatsNegativeCache(placeId);
    }
    return withPublishedReviewCount(fallbackGoogleReviewSnapshot());
  }
}
