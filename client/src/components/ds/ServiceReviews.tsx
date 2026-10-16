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
    <section className={cn("bg-cream-100 py-16 sm:py-20", className)} aria-labelledby="service-reviews-title">
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
        <div className="reveal-stagger mt-10 grid gap-5 md:grid-cols-3">
          {quotes.map((q) => (
            <ReviewCard key={q.name} review={q} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceReviews;
