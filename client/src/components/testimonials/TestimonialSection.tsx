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
    <section className={cn("py-12", className)}>
      <div
        className={cn(
          "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
          containerClassName,
        )}
      >
        <div className="text-center mb-10">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-3xl md:text-4xl font-bold font-heading text-[#1F2933]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "grid gap-6 sm:grid-cols-2 xl:grid-cols-3",
            gridClassName,
          )}
        >
          {testimonials.map((testimonial) => (
            <TestimonialQuote
              key={testimonial.name}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
