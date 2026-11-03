"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  fallbackPublishedReviewStats,
  type PublishedReviewStats,
} from "@shared/reviewStats";

const ReviewStatsContext = createContext<PublishedReviewStats>(fallbackPublishedReviewStats);

export function ReviewStatsProvider({
  value,
  children,
}: {
  readonly value: PublishedReviewStats;
  readonly children: ReactNode;
}) {
  return <ReviewStatsContext.Provider value={value}>{children}</ReviewStatsContext.Provider>;
}

export function useReviewStats(): PublishedReviewStats {
  return useContext(ReviewStatsContext);
}
