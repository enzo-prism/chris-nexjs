"use client";

import { useEffect, useState } from "react";
import {
  getOfficeTodayISO,
  resolveHolidayHours,
  type ResolvedHolidayHours,
} from "@/lib/data";

/**
 * Temporary-hours notice, resolved only after mount.
 *
 * Pages are prerendered at build time, so "today" on the server is the build
 * day while "today" in the browser is the visit day. Resolving the notice
 * during render (as `useHolidayHours` does) therefore produces different
 * markup on the server and the client as soon as an entry starts or expires
 * between a build and a visit (React #418). Returning `null` until mount
 * keeps SSR and the first client render identical; the notice then appears
 * with the visitor's office-local date.
 */
export function useHolidayNotice(): ResolvedHolidayHours | null {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(getOfficeTodayISO());
  }, []);

  return today ? resolveHolidayHours(today) : null;
}

export default useHolidayNotice;
