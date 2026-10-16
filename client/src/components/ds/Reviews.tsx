import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const STAR =
  "M12 2.6l2.7 6.1 6.6.6-5 4.4 1.5 6.5L12 16.8l-5.8 3.4 1.5-6.5-5-4.4 6.6-.6Z";

/** Five gold stars (decorative unless a label is given). */
export function StarRow({
  className,
  label,
  size = "h-4 w-4",
}: {
  readonly className?: string;
  readonly label?: string;
  readonly size?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 text-gold-400", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={size} fill="currentColor" aria-hidden="true">
          <path d={STAR} />
        </svg>
      ))}
    </span>
  );
}

export type ReviewQuote = {
  readonly name: string;
  readonly text: string;
  /** Short context line, e.g. "On Angelisa" or "Patient since 1982". */
  readonly context?: string;
  readonly source?: "Google" | "Yelp";
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const avatarTones = [
  "bg-evergreen-100 text-evergreen-800",
  "bg-gold-200 text-gold-700",
  "bg-mint-200 text-evergreen-800",
  "bg-cream-200 text-ink-soft",
] as const;

function toneFor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return avatarTones[hash % avatarTones.length];
}

/** A single patient quote card. Text must be a verbatim excerpt. */
export function ReviewCard({
  review,
  className,
  size = "md",
  footer,
}: {
  readonly review: ReviewQuote;
  readonly className?: string;
  readonly size?: "sm" | "md" | "lg";
  readonly footer?: ReactNode;
}) {
  return (
    <figure
      className={cn(
        "cw-cobweb relative flex h-full flex-col rounded-[1.5rem] border border-cream-300/80 bg-white p-5 shadow-soft",
        size === "lg" && "p-7 sm:p-8",
        className,
      )}
    >
      <StarRow />
      <blockquote
        className={cn(
          "mt-3 flex-1 text-pretty text-ink",
          size === "sm" && "text-[15px] leading-6",
          size === "md" && "text-base leading-7",
          size === "lg" && "font-heading text-xl leading-8 sm:text-[1.6rem] sm:leading-10",
        )}
      >
        <p>“{review.text}”</p>
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            toneFor(review.name),
          )}
          aria-hidden="true"
        >
          {initials(review.name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold text-ink">{review.name}</span>
          <span className="block text-sm text-ink-muted">
            {review.context ?? `${review.source ?? "Google"} review`}
          </span>
        </span>
      </figcaption>
      {footer}
    </figure>
  );
}

/**
 * Endless ribbon of short quotes (CSS-only). The list is rendered once for
 * assistive tech; the visual loop uses an aria-hidden clone. Hover/focus
 * pauses; reduced motion turns it into a scrollable row.
 */
export function ReviewMarquee({
  reviews,
  className,
  reverse = false,
  duration = 80,
  label = "What patients say",
}: {
  readonly reviews: readonly ReviewQuote[];
  readonly className?: string;
  readonly reverse?: boolean;
  readonly duration?: number;
  readonly label?: string;
}) {
  const item = (r: ReviewQuote, key: string, hidden = false) => (
    <li
      key={key}
      aria-hidden={hidden || undefined}
      {...(hidden ? { "data-marquee-clone": "" } : null)}
      className="w-[20rem] shrink-0 pr-4 sm:w-[23.5rem]"
    >
      <ReviewCard review={r} size="sm" className="shadow-none" />
    </li>
  );
  return (
    <section aria-label={label} className={cn("marquee py-2", className)}>
      <ul
        className="marquee-track"
        style={{
          ["--marquee-duration" as string]: `${duration}s`,
          animationDirection: reverse ? "reverse" : undefined,
        }}
      >
        {reviews.map((r, i) => item(r, `a-${i}`))}
        {reviews.map((r, i) => item(r, `b-${i}`, true))}
      </ul>
    </section>
  );
}
