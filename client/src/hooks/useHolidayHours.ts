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
 * The office-local "today" is computed in a fixed timezone, so the server can
 * safely prune past entries before first paint. That avoids rendering an
 * expired banner during SSR and removing it after hydration.
 */
export function useHolidayHours(): ResolvedHolidayHours | null {
  const [today, setToday] = useState(() => getOfficeTodayISO());

  useEffect(() => {
    setToday(getOfficeTodayISO());
  }, []);

  return resolveHolidayHours(today);
}
