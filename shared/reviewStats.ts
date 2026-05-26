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
export const PUBLISHED_REVIEW_RATING = 5;
export const PUBLISHED_REVIEW_COUNT = 308;

export const publishedTestimonialAggregateRating = {
  ratingValue: PUBLISHED_REVIEW_RATING,
  reviewCount: PUBLISHED_REVIEW_COUNT,
} as const;
