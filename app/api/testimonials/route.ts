import { NextResponse } from "next/server";
import { getStorage } from "../../../server/storage/repository";
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

const getTestimonialKey = (testimonial: Pick<Testimonial, "name" | "text" | "image">) =>
  `${testimonial.name}::${testimonial.text}::${testimonial.image}`;

const hasCurrentSeedCoverage = (
  testimonials: readonly Testimonial[],
  seedTestimonials: readonly Testimonial[],
) => {
  const testimonialKeys = new Set(testimonials.map(getTestimonialKey));
  return seedTestimonials.every((seed) => testimonialKeys.has(getTestimonialKey(seed)));
};

export async function GET() {
  try {
    const storage = await getStorage();
    const testimonials = await storage.getTestimonials();
    const seedTestimonials = buildSeedTestimonials();
    const responseData =
      hasCurrentSeedCoverage(testimonials, seedTestimonials)
        ? testimonials
        : seedTestimonials;

    return NextResponse.json(responseData.filter(isPublishedTestimonial), {
      status: 200,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch testimonials" },
      { status: 500 },
    );
  }
}
