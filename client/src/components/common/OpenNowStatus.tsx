"use client";

import { useEffect, useState } from "react";
import { officeInfo } from "@/lib/data";

const OFFICE_TIME_ZONE = "America/Los_Angeles";

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

type OpenStatus = {
  isOpen: boolean;
  closesAt?: string;
};

const parseClockMinutes = (value: string): number => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatClock = (value: string): string => {
  const [hours, minutes] = value.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

const getOfficeStatus = (now: Date): OpenStatus => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: OFFICE_TIME_ZONE,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const nowMinutes = hour * 60 + minute;

  if (!WEEKDAY_NAMES.includes(weekday as (typeof WEEKDAY_NAMES)[number])) {
    return { isOpen: false };
  }

  const isoDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: OFFICE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const closedToday = officeInfo.specialOpeningHoursSpecification.some(
    (entry) =>
      entry.opens === "00:00" &&
      entry.closes === "00:00" &&
      entry.validFrom <= isoDate &&
      isoDate <= entry.validThrough,
  );
  if (closedToday) {
    return { isOpen: false };
  }

  for (const spec of officeInfo.openingHoursSpecification) {
    const days = Array.isArray(spec.dayOfWeek) ? spec.dayOfWeek : [spec.dayOfWeek];
    if (!days.includes(weekday as never)) continue;
    const opensAt = parseClockMinutes(spec.opens);
    const closesAt = parseClockMinutes(spec.closes);
    if (nowMinutes >= opensAt && nowMinutes < closesAt) {
      return { isOpen: true, closesAt: formatClock(spec.closes) };
    }
  }

  return { isOpen: false };
};

type OpenNowStatusProps = {
  className?: string;
};

const OpenNowStatus = ({ className = "" }: OpenNowStatusProps) => {
  const [status, setStatus] = useState<OpenStatus | null>(null);

  // Computed after mount only: office-local time depends on the visitor's
  // clock, so rendering it during SSR would cause a hydration mismatch.
  useEffect(() => {
    setStatus(getOfficeStatus(new Date()));
    const interval = window.setInterval(() => {
      setStatus(getOfficeStatus(new Date()));
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const showOpen = status?.isOpen === true;
  const showClosed = status?.isOpen === false;

  // Both messages are always rendered in an overlapping grid cell so the
  // chip's footprint equals the longer string from the first paint onward —
  // the surrounding trust strip is a wrapping flex row, and content popping
  // in after hydration would reflow it and count against CLS.
  return (
    <span
      className={`inline-flex h-5 items-center gap-2 text-sm font-medium ${className}`}
      role="status"
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 rounded-full ${
          showOpen
            ? "bg-emerald-500"
            : showClosed
              ? "bg-slate-400"
              : "bg-slate-300"
        }`}
      />
      <span className="grid">
        <span
          aria-hidden={!showOpen}
          className={`col-start-1 row-start-1 whitespace-nowrap ${showOpen ? "" : "invisible"}`}
        >
          Open now — closes {status?.closesAt ?? "5:00 PM"}
        </span>
        <span
          aria-hidden={!showClosed}
          className={`col-start-1 row-start-1 whitespace-nowrap ${showClosed ? "" : "invisible"}`}
        >
          Closed now — we reply the next business day
        </span>
      </span>
    </span>
  );
};

export default OpenNowStatus;
