// Lightweight review aggregate for client-side structured data.
//
// These are plain literals on purpose: the global Dentist schema is built in a
// client component (AppPageShell), so anything it imports ships in the shared
// browser bundle. Deriving the count from the full review dataset would pull
// the entire 50KB `googleReviewsData` corpus into every page's First Load JS.
//
// Drift is guarded at build time in `shared/testimonialsData.ts`, which asserts
// that PUBLISHED_REVIEW_COUNT matches the real published-review corpus. If that
// assertion fails after a `reviews:import`, update PUBLISHED_REVIEW_COUNT here.
//
// Live Google totals (when GOOGLE_PLACES_API_KEY is set) resolve through
// `shared/googlePlaceReviews.ts` and fall back to these committed values.
export const PUBLISHED_REVIEW_RATING = 5;

// ISO date the committed Google / published counts were last refreshed from
// the review export. Bump this alongside the counts on every import.
export const REVIEW_STATS_LAST_UPDATED = "2026-09-23";

// Google reviews only — used by Google-branded surfaces (hero badge, Google
// reviews widget) so their copy stays accurate.
export const GOOGLE_REVIEW_COUNT = 382;

// All published 5-star reviews across sources (Google + Yelp). Drives the
// /testimonials total. NOT emitted as a Dentist-schema aggregateRating —
// Google disallows aggregate ratings copied from third-party platforms. Must
// equal `publishedTestimonialReviewCount` (guarded at build time in
// testimonialsData.ts).
export const PUBLISHED_REVIEW_COUNT = 392;

export const publishedTestimonialAggregateRating = {
  ratingValue: PUBLISHED_REVIEW_RATING,
  reviewCount: PUBLISHED_REVIEW_COUNT,
} as const;

export type ReviewStatsSource = "live" | "fallback";

export type GoogleReviewStats = {
  readonly ratingValue: number;
  readonly reviewCount: number;
  readonly lastUpdated: string;
  readonly source: ReviewStatsSource;
};

export type PublishedReviewStats = GoogleReviewStats & {
  readonly publishedReviewCount: number;
};

export const fallbackGoogleReviewStats: GoogleReviewStats = {
  ratingValue: PUBLISHED_REVIEW_RATING,
  reviewCount: GOOGLE_REVIEW_COUNT,
  lastUpdated: REVIEW_STATS_LAST_UPDATED,
  source: "fallback",
};
