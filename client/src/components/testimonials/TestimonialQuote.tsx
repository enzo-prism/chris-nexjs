import { Quote, Star } from "lucide-react";
import type { InsertTestimonial } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TestimonialQuoteProps {
  testimonial: InsertTestimonial;
  className?: string;
  hideStars?: boolean;
}

const TestimonialQuote = ({ testimonial, className, hideStars = false }: TestimonialQuoteProps) => {
  const { name, text, rating } = testimonial;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-8",
        className,
      )}
    >
      <Quote className="h-8 w-8 text-primary/40" />
      <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
        "{text}"
      </p>
      <div className="mt-6 flex flex-col gap-2 text-sm sm:text-base">
        {!hideStars && (
          <div className="flex text-blue-500">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={`${name}-star-${index}`}
                className="h-4 w-4"
                fill={index < rating ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
            ))}
          </div>
        )}
        <span className="font-semibold text-slate-900">{name}</span>
      </div>
    </div>
  );
};

export default TestimonialQuote;
