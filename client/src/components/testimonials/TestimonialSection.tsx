"use client";

import type { InsertTestimonial } from "@shared/schema";
import { cn } from "@/lib/utils";
import TestimonialQuote from "./TestimonialQuote";

interface TestimonialSectionProps {
  title: string;
  subtitle?: string;
  testimonials: readonly InsertTestimonial[];
  className?: string;
  containerClassName?: string;
  gridClassName?: string;
  eyebrow?: string;
}

const TestimonialSection = ({
  title,
  subtitle,
  testimonials,
  className,
  containerClassName,
  gridClassName,
  eyebrow,
}: TestimonialSectionProps) => {
  if (!testimonials.length) {
    return null;
  }

  return (
    <section className={cn("bg-cream-100 py-16 sm:py-20", className)}>
      <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", containerClassName)}>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="eyebrow justify-center">{eyebrow ?? "Patient reviews"}</p>
          <h2 className="h-section mt-4 text-balance">{title}</h2>
          {subtitle ? <p className="lead mx-auto mt-4">{subtitle}</p> : null}
        </div>

        <div className={cn("reveal-stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3", gridClassName)}>
          {testimonials.map((testimonial) => (
            <TestimonialQuote key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
