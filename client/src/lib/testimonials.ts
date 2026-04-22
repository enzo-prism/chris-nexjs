import type { InsertTestimonial } from "@shared/schema";
import { featuredTestimonials } from "@/data/featuredTestimonials";
import {
  testimonialCollections,
  type TestimonialCollectionKey,
} from "@/data/testimonialCollections";

const seededTestimonials: InsertTestimonial[] = [...featuredTestimonials];

export const allTestimonials = seededTestimonials;

export function getTestimonialByName(name: string): InsertTestimonial | undefined {
  return seededTestimonials.find(
    (testimonial) => testimonial.name.toLowerCase() === name.toLowerCase(),
  );
}

export function getTestimonialsByNames(
  names: ReadonlyArray<string>,
): InsertTestimonial[] {
  const seen = new Set<string>();
  const selected: InsertTestimonial[] = [];

  names.forEach((name) => {
    const match = getTestimonialByName(name);
    if (match && !seen.has(match.name)) {
      selected.push(match);
      seen.add(match.name);
    }
  });

  if (selected.length === names.length) {
    return selected;
  }

  // Fill any missing slots with the first testimonials not already selected
  for (const testimonial of seededTestimonials) {
    if (selected.length === names.length) break;
    if (!seen.has(testimonial.name)) {
      selected.push(testimonial);
      seen.add(testimonial.name);
    }
  }

  return selected;
}

export function getTestimonialCollection(
  key: TestimonialCollectionKey,
): InsertTestimonial[] {
  return getTestimonialsByNames(testimonialCollections[key]);
}
