"use client";

import TestimonialQuote from "@/components/testimonials/TestimonialQuote";
import type { InsertTestimonial } from "@shared/schema";

const familyTestimonials: readonly InsertTestimonial[] = [
  {
    name: "Michael Austin",
    rating: 5,
    location: "Google Review",
    image: "",
    text: "Been getting my dental care at this office for nearly 30 years, and both my parents did so before me. Kind, caring, gentle, and reasonably priced!",
  },
  {
    name: "Ashley Chung",
    rating: 5,
    location: "Google Review",
    image: "",
    text: "Been going here for 10+ years since I was a kid. Great establishment and excellent teeth cleaning and guidance!",
  },
  {
    name: "Giordano Bruno Beretta",
    rating: 5,
    location: "Google Review",
    image: "",
    text: "They have been taking good care of my teeth since 1984 and they are in good shape. I highly recommend Dr. Hamamoto for her expertise and humanity.",
  },
];

const MenloParkFamilyTestimonials = () => (
  <section className="py-12 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#1F2933]">
          Trusted by families across the Peninsula
        </h2>
        <p className="mt-4 text-sm text-[#4B5563] sm:text-base max-w-3xl mx-auto">
          Patients appreciate the calm environment, conservative care, and clear
          explanations whether they are coming in for a first visit or continuing
          long-term maintenance.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {familyTestimonials.map((testimonial) => (
          <TestimonialQuote key={testimonial.name} testimonial={testimonial} />
        ))}
      </div>

      <p className="mt-8 text-xs text-slate-500 text-center">
        Last updated: December 2025
      </p>
    </div>
  </section>
);

export default MenloParkFamilyTestimonials;
