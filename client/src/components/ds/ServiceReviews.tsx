import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { GOOGLE_REVIEW_COUNT } from "@shared/reviewStats";
import { cn } from "@/lib/utils";
import { reviewsFor, type ReviewTag } from "@/data/serviceReviews";
import { ReviewCard } from "./Reviews";

/** "What patients say" band with service-matched verbatim quotes. */
export function ServiceReviews({
  tags,
  title = (
    <>
      What patients <em>say</em>
    </>
  ),
  note,
  limit = 3,
  className,
}: {
  readonly tags: readonly ReviewTag[];
  readonly title?: React.ReactNode;
  /** Honest framing when quotes are about general care, not this service. */
  readonly note?: string;
  readonly limit?: number;
  readonly className?: string;
}) {
  const quotes = reviewsFor(tags, limit);
  if (!quotes.length) return null;
  return (
    <section className={cn("bg-cream-100 py-12 sm:py-20", className)} aria-labelledby="service-reviews-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Patient reviews</p>
            <h2 id="service-reviews-title" className="h-section mt-4">
              {title}
            </h2>
            {note ? <p className="mt-3 text-[15px] text-ink-muted">{note}</p> : null}
          </div>
          <Link href="/testimonials" className="btn btn-outline self-start sm:self-auto">
            All {GOOGLE_REVIEW_COUNT} Google reviews
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        {/* Phones: a swipe row (saves ~2 screens per page); md+: three columns. */}
        <ul className="reveal-stagger -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scroll-padding-inline:1rem] md:mx-0 md:mt-10 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          {quotes.map((q) => (
            <li key={q.name} className="w-[85%] max-w-[22rem] shrink-0 snap-start md:w-auto md:max-w-none">
              <ReviewCard review={q} className="h-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default ServiceReviews;
