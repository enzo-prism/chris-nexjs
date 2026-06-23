"use client";

import { useEffect, useState } from "react";
import {
  getOfficeTodayISO,
  resolveHolidayHours,
  type ResolvedHolidayHours,
} from "@/lib/data";

/**
 * Returns the temporary-hours notice with past dates pruned, or `null` when
 * nothing is active/upcoming.
 *
 * The office-local "today" depends on the visitor's clock, so — like
 * `OpenNowStatus` — it is computed after mount to avoid hydration mismatches.
 * Before mount we resolve with `null`, which keeps every entry so the server
 * HTML matches the first client render; the post-mount pass then drops any
 * date that has already passed.
 */
export function useHolidayHours(): ResolvedHolidayHours | null {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(getOfficeTodayISO());
  }, []);

  return resolveHolidayHours(today);
}
