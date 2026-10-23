import { unstable_cache } from "next/cache";
import {
  assertUsableGoogleReviewStats,
  fallbackGoogleReviewSnapshot,
  GOOGLE_REVIEW_STATS_REVALIDATE_SECONDS,
  loadGoogleReviewStats,
  type GoogleReviewStats,
  withPublishedReviewCount,
  type PublishedReviewStats,
} from "@shared/googlePlaceReviews";

async function fetchGoogleReviewStatsUncached(): Promise<GoogleReviewStats> {
  const stats = await loadGoogleReviewStats({
    fetchImpl: (input, init) =>
      fetch(input, {
        ...init,
        next: { revalidate: GOOGLE_REVIEW_STATS_REVALIDATE_SECONDS },
      }),
  });
  return assertUsableGoogleReviewStats(stats);
}

const getCachedGoogleReviewStats = unstable_cache(
  fetchGoogleReviewStatsUncached,
  ["google-place-review-stats"],
  {
    revalidate: GOOGLE_REVIEW_STATS_REVALIDATE_SECONDS,
    tags: ["google-review-stats"],
  },
);

/**
 * Daily-cached Google review totals. Always returns the committed fallback
 * when Places is unset or the live payload is unusable — never 0 or blank.
 */
export async function getGoogleReviewStats(): Promise<PublishedReviewStats> {
  try {
    const stats = await getCachedGoogleReviewStats();
    return withPublishedReviewCount(assertUsableGoogleReviewStats(stats));
  } catch {
    return withPublishedReviewCount(fallbackGoogleReviewSnapshot());
  }
}
