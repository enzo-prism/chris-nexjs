import type { InsertTestimonial } from "./schema";
import { googleReviewSeedData } from "./googleReviewsData";
import { yelpReviewSeedData } from "./yelpReviewsData";
import { PUBLISHED_REVIEW_COUNT } from "./reviewStats";

type SeedTestimonial = Omit<InsertTestimonial, "location" | "image"> &
  Partial<Pick<InsertTestimonial, "location" | "image">>;

export const PUBLISHED_TESTIMONIAL_RATING = 5;

const DEFAULT_LOCATIONS = [
  "Google Review",
  "Palo Alto, CA",
  "Menlo Park, CA",
  "Mountain View, CA",
  "Los Altos, CA",
  "Verified Patient",
];

export const isPublishedTestimonial = (testimonial: { rating: number }) =>
  testimonial.rating === PUBLISHED_TESTIMONIAL_RATING;

// Source of truth for published testimonials: only 5-star reviews.
// Yelp reviews are listed first so they surface on the first page of
// /testimonials; the full Google export follows.
export const testimonialSeedData: SeedTestimonial[] = [
  ...yelpReviewSeedData,
  ...googleReviewSeedData,
].filter(isPublishedTestimonial);

export const publishedTestimonialReviewCount = testimonialSeedData.length;

// Build-time guard: the client-side structured data uses literal review stats
// (see shared/reviewStats.ts) to keep the browser bundle free of the full review
// corpus. Assert those literals stay in sync with the real published reviews so
// the Dentist schema's aggregateRating never silently drifts after an import.
if (publishedTestimonialReviewCount !== PUBLISHED_REVIEW_COUNT) {
  throw new Error(
    `Review aggregate drift: ${publishedTestimonialReviewCount} published reviews ` +
      `but shared/reviewStats.ts declares ${PUBLISHED_REVIEW_COUNT}. ` +
      `Update PUBLISHED_REVIEW_COUNT in shared/reviewStats.ts.`,
  );
}

export const buildInsertTestimonial = (
  testimonial: SeedTestimonial,
  index: number,
): InsertTestimonial => {
  const location =
    testimonial.location ??
    DEFAULT_LOCATIONS[index % DEFAULT_LOCATIONS.length];

  return {
    ...testimonial,
    location,
    image: testimonial.image ?? "",
  };
};
