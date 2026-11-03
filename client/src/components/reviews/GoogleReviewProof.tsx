"use client";

import { StarRow } from "@/components/ds/Reviews";
import {
  formatGoogleRating,
  googleReviewHeadingLabel,
  googleReviewProofLabel,
  googleReviewStarLabel,
} from "@shared/reviewStats";

import { useReviewStats } from "./ReviewStatsProvider";
import type { ReviewCountSurfaceId, ReviewCountVariant } from "./reviewCountSurfaces";

type GoogleReviewProofProps = {
  readonly surface: ReviewCountSurfaceId;
  readonly variant: ReviewCountVariant;
};

export function GoogleReviewProof({ surface, variant }: GoogleReviewProofProps) {
  const stats = useReviewStats();
  const attrs = {
    "data-review-surface": surface,
    "data-review-count": String(stats.reviewCount),
    "data-review-rating": formatGoogleRating(stats.ratingValue),
    "data-review-source": stats.source,
  };

  switch (variant) {
    case "chip":
      return (
        <span className="contents" {...attrs}>
          <StarRow size="h-3.5 w-3.5" />
          {googleReviewProofLabel(stats)}
        </span>
      );
    case "utility":
      return <span {...attrs}>{googleReviewProofLabel(stats)}</span>;
    case "heading":
      return (
        <span {...attrs}>
          {googleReviewHeadingLabel(stats)}, <em>and counting</em>
        </span>
      );
    case "all-link":
      return <span {...attrs}>All {stats.reviewCount} Google reviews</span>;
    case "read-link":
      return <span {...attrs}>Read {stats.reviewCount} Google reviews</span>;
    case "hero":
      return (
        <div {...attrs}>
          <StarRow size="h-5 w-5" label={googleReviewStarLabel(stats)} />
          <p className="mt-2 flex items-baseline gap-3">
            <span className="font-heading text-[3.6rem] font-medium leading-none sm:text-[4.6rem]">
              {stats.source === "live" ? formatGoogleRating(stats.ratingValue) : stats.reviewCount}
            </span>
            <span className="max-w-[11rem] text-[15px] font-semibold leading-snug text-cream-100">
              {stats.source === "live"
                ? `from ${stats.reviewCount} Google reviews`
                : "five-star Google reviews"}
            </span>
          </p>
        </div>
      );
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}
