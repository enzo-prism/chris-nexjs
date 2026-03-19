import { useEffect, useState } from "react";
import { ArrowRight, CalendarCheck, CalendarClock, X } from "lucide-react";
import { holidayHours } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HolidayEntry = {
  day: string;
  hours: string;
  status: "closed" | "varies" | "regular";
  badge?: string;
};

type HolidayHoursNoticeProps = {
  variant?: "banner" | "card";
  className?: string;
  containerClassName?: string;
};

const HolidayHoursNotice = ({
  variant = "banner",
  className,
  containerClassName,
}: HolidayHoursNoticeProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const dismissalKey = holidayHours?.id
    ? `holidayHoursDismissed-${holidayHours.id}`
    : "holidayHoursDismissed";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedValue = window.localStorage.getItem(dismissalKey);
    if (storedValue === "true") {
      setIsDismissed(true);
    }
  }, [dismissalKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(dismissalKey, "true");
    }
  };

  if (!holidayHours?.active) {
    return null;
  }

  const normalizedEntries: HolidayEntry[] = (holidayHours.entries as readonly unknown[] | undefined ?? []).map(
    (entry) =>
      ({
        day: typeof entry === "object" && entry !== null && "day" in entry
          ? String((entry as { day: unknown }).day)
          : "",
        hours: typeof entry === "object" && entry !== null && "hours" in entry
          ? String((entry as { hours: unknown }).hours)
          : "",
        status:
          typeof entry === "object" &&
          entry !== null &&
          "status" in entry &&
          typeof (entry as { status: unknown }).status === "string"
            ? ((entry as { status: "closed" | "varies" | "regular" }).status)
            : String(
                typeof entry === "object" && entry !== null && "hours" in entry
                  ? (entry as { hours: unknown }).hours
                  : "",
              ).toLowerCase().includes("closed")
              ? "closed"
              : "varies",
        badge:
          typeof entry === "object" &&
          entry !== null &&
          "badge" in entry &&
          typeof (entry as { badge: unknown }).badge === "string"
            ? String((entry as { badge: unknown }).badge)
            : undefined,
      }) as HolidayEntry,
  );
  const hasClosedEntry = normalizedEntries.some((entry) => entry.status === "closed");
  const hasVariableEntry = normalizedEntries.some((entry) => entry.status === "varies");
  const noticeLabel =
    hasClosedEntry || hasVariableEntry ? "Schedule Update" : "Hours Update";
  const titleRange =
    holidayHours.title.replace(/^temporary schedule update:\s*/i, "").trim() ||
    holidayHours.title;
  const displayEntries = normalizedEntries.map((entry) => {
    const isClosed = entry.status === "closed";
    const isVariable = entry.status === "varies";

    return {
      ...entry,
      isClosed,
      isVariable,
      badgeText: entry.badge,
    };
  });
  const closedDays = displayEntries
    .filter((entry) => entry.isClosed)
    .map((entry) => entry.day);
  const joinedClosedDays =
    closedDays.length <= 1
      ? (closedDays[0] ?? "")
      : `${closedDays.slice(0, -1).join(", ")} & ${closedDays.at(-1)}`;
  const noticeHeadline = titleRange ? `Temporary Hours: ${titleRange}` : holidayHours.title;
  const noticeSummary = [
    hasVariableEntry ? "Hours may vary during this period." : undefined,
    joinedClosedDays ? `Closed ${joinedClosedDays}.` : undefined,
    "Call to confirm availability before visiting.",
  ]
    .filter(Boolean)
    .join(" ");

  if (variant === "card") {
    return (
      <div
        className={cn(
          "rounded-3xl border border-slate-200 bg-white shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)]",
          className
        )}
      >
        <div className="relative overflow-hidden rounded-[23px] bg-[radial-gradient(circle_at_top_left,#ffffff_0%,#f5f9ff_48%,#eef2f7_100%)] px-5 py-6 text-sm">
          <div
            className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-blue-100/40 blur-3xl"
            aria-hidden="true"
          />
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-full bg-[#0b1f3a] text-white shadow-sm ring-1 ring-white/80 flex items-center justify-center">
              <CalendarClock className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{noticeLabel}</p>
              <p className="text-lg font-semibold font-heading text-slate-900 leading-tight text-balance">{noticeHeadline}</p>
            </div>
          </div>

          <p className="text-slate-600 mb-5 leading-relaxed">{holidayHours.description}</p>

          <ul className="space-y-3">
            {displayEntries.map((entry) => {
              return (
                <li
                  key={entry.day}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border px-4 py-3",
                    entry.isClosed
                      ? "border-amber-200 bg-amber-50/70"
                      : entry.isVariable
                        ? "border-blue-200 bg-blue-50/70"
                        : "border-slate-200/80 bg-white/80"
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-0 h-full w-1",
                      entry.isClosed
                        ? "bg-amber-400"
                        : entry.isVariable
                          ? "bg-blue-400"
                          : "bg-blue-200"
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="font-semibold text-slate-900">{entry.day}</span>
                    <span
                      className={cn(
                        "sm:text-right",
                        entry.isClosed
                          ? "text-amber-900 font-semibold"
                          : entry.isVariable
                            ? "text-blue-900 font-semibold"
                            : "text-slate-600"
                      )}
                    >
                      {entry.hours}
                    </span>
                  </div>
                  {entry.badgeText ? (
                    <span
                      className={cn(
                        "mt-2 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
                        entry.isClosed
                          ? "border-amber-200 bg-amber-100/80 text-amber-900"
                          : entry.isVariable
                            ? "border-blue-200 bg-blue-100/80 text-blue-900"
                            : "border-slate-200 bg-slate-100 text-slate-700",
                      )}
                    >
                      {entry.badgeText}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {holidayHours.cta && (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={holidayHours.cta.href}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {holidayHours.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              {holidayHours.footerNote ? (
                <span className="text-xs text-slate-500">
                  {holidayHours.footerNote}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isDismissed) {
    return null;
  }

  return (
    <section
      className={cn(
        "border-b border-slate-200 bg-white text-slate-800",
        className,
      )}
      aria-label={noticeLabel}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={cn(
          "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
          containerClassName,
        )}
      >
        <div className="relative py-4 pr-12 lg:py-5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute right-0 top-3 z-10 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Dismiss schedule update notice"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.9fr)] lg:items-start lg:gap-8">
            <div className="min-w-0">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <CalendarClock className="h-5 w-5" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {noticeLabel}
                  </p>
                  <h2 className="mt-1 font-heading text-xl font-semibold leading-tight text-slate-950 text-balance">
                    {noticeHeadline}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 text-pretty">
                    {noticeSummary}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {holidayHours.cta ? (
                      <Button
                        asChild
                        className="ui-btn-primary min-h-11 rounded-full px-4 text-sm font-semibold"
                      >
                        <a href={holidayHours.cta.href}>
                          <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>Call to Confirm</span>
                          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                        </a>
                      </Button>
                    ) : null}

                    {holidayHours.footerNote ? (
                      <p className="text-xs leading-5 text-slate-500">
                        {holidayHours.footerNote}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50">
              <ul className="divide-y divide-slate-200" aria-label="Temporary schedule details">
                {displayEntries.map((entry) => (
                  <li
                    key={entry.day}
                    className="flex items-start justify-between gap-4 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{entry.day}</p>
                      {entry.badgeText ? (
                        <p className="mt-0.5 text-xs text-slate-500">{entry.badgeText}</p>
                      ) : null}
                    </div>

                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                        entry.isClosed
                          ? "bg-amber-100 text-amber-900"
                          : entry.isVariable
                            ? "bg-blue-100 text-blue-900"
                            : "bg-slate-200 text-slate-700",
                      )}
                    >
                      {entry.hours}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HolidayHoursNotice;
