import type { InsertTestimonial } from "./schema";
import { googleReviewSeedData } from "./googleReviewsData";

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

// Source of truth for published testimonials: only 5-star reviews from the full Google export.
export const testimonialSeedData: SeedTestimonial[] =
  googleReviewSeedData.filter(isPublishedTestimonial);

export const publishedTestimonialReviewCount = testimonialSeedData.length;

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
