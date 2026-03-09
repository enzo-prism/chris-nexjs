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

export async function GET() {
  try {
    const storage = await getStorage();
    const testimonials = await storage.getTestimonials();
    const seedCount = testimonialSeedData.length;
    const responseData =
      testimonials.length >= seedCount ? testimonials : buildSeedTestimonials();

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
