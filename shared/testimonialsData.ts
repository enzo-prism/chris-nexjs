import type { InsertTestimonial } from "./schema";
import { googleReviewSeedData } from "./googleReviewsData";

type SeedTestimonial = Omit<InsertTestimonial, "location" | "image"> &
  Partial<Pick<InsertTestimonial, "location" | "image">>;

const DEFAULT_LOCATIONS = [
  "Google Review",
  "Palo Alto, CA",
  "Menlo Park, CA",
  "Mountain View, CA",
  "Los Altos, CA",
  "Verified Patient",
];

// Source of truth: imported from full Google review export (319 reviews).
export const testimonialSeedData: SeedTestimonial[] = googleReviewSeedData;

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
