import { getStorage } from "./repository";
import type { Testimonial } from "@shared/schema";
import {
  buildInsertTestimonial,
  isPublishedTestimonial,
  testimonialSeedData,
} from "@shared/testimonialsData";

const buildSeedTestimonials = (): Testimonial[] =>
  testimonialSeedData.map((seed, index) => ({
    id: index + 1,
    ...buildInsertTestimonial(seed, index),
  }));

const getTestimonialKey = (
  testimonial: Pick<Testimonial, "name" | "text" | "image">,
): string => `${testimonial.name}::${testimonial.text}::${testimonial.image}`;

const hasCurrentSeedCoverage = (
  testimonials: readonly Testimonial[],
  seedTestimonials: readonly Testimonial[],
): boolean => {
  const testimonialKeys = new Set(testimonials.map(getTestimonialKey));
  return seedTestimonials.every((seed) =>
    testimonialKeys.has(getTestimonialKey(seed)),
  );
};

/**
 * Published testimonials with the same seed-coverage fallback and
 * publish filtering as GET /api/testimonials, so server-rendered pages
 * and the API always agree.
 */
export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const storage = await getStorage();
  const testimonials = await storage.getTestimonials();
  const seedTestimonials = buildSeedTestimonials();
  const responseData = hasCurrentSeedCoverage(testimonials, seedTestimonials)
    ? testimonials
    : seedTestimonials;

  return responseData.filter(isPublishedTestimonial);
}
