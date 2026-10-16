import type { InsertTestimonial } from "@shared/schema";
import { cn } from "@/lib/utils";
import { isNoAdditionalCommentPlaceholder } from "@/lib/testimonialText";
import { StarRow } from "@/components/ds/Reviews";

interface TestimonialQuoteProps {
  testimonial: InsertTestimonial;
  className?: string;
  hideStars?: boolean;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const TestimonialQuote = ({ testimonial, className, hideStars = false }: TestimonialQuoteProps) => {
  const { name, text, location } = testimonial;
  const hasVisibleText = text.trim().length > 0 && !isNoAdditionalCommentPlaceholder(text);
  const source = location?.toLowerCase().includes("yelp") ? "Yelp review" : "Google review";

  return (
    <figure
      className={cn(
        "cw-cobweb relative flex h-full flex-col rounded-[1.5rem] border border-cream-300/80 bg-white p-6 shadow-soft sm:p-7",
        className,
      )}
    >
      {!hideStars ? <StarRow label="Five stars" /> : null}
      {hasVisibleText ? (
        <blockquote className="mt-3 flex-1 text-pretty text-base leading-7 text-ink">
          <p>“{text}”</p>
        </blockquote>
      ) : (
        <p className="mt-3 flex-1 text-sm italic text-ink-muted">Left a five-star rating.</p>
      )}
      <figcaption className="mt-5 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-evergreen-100 text-sm font-bold text-evergreen-800"
        >
          {initials(name)}
        </span>
        <span>
          <span className="block font-semibold text-ink">{name}</span>
          <span className="block text-sm text-ink-muted">{source}</span>
        </span>
      </figcaption>
    </figure>
  );
};

export default TestimonialQuote;
