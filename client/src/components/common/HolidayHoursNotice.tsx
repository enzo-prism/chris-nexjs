"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  ChevronDown,
  X,
} from "lucide-react";
// Resolved after mount: prerendered pages would otherwise mismatch on
// hydration once a temporary-hours entry starts or expires after a build.
import { useHolidayNotice } from "@/components/patients/useHolidayNotice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const notice = useHolidayNotice();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const dismissalKey = notice?.id
    ? `holidayHoursDismissed-${notice.id}`
    : "holidayHoursDismissed";

  useEffect(() => {
    try {
      if (window.localStorage.getItem(dismissalKey) === "true") {
        setIsDismissed(true);
      }
    } catch {
      // Storage can be blocked (private mode); the notice simply stays visible.
    }
  }, [dismissalKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      window.localStorage.setItem(dismissalKey, "true");
    } catch {
      // Dismissal still applies for this page view.
    }
  };

  // `notice` is null when the temporary schedule is inactive or every date in
  // it has already passed — in either case nothing should render.
  if (!notice) {
    return null;
  }

  const noticeLabel =
    notice.hasClosed || notice.hasVaries ? "Schedule Update" : "Hours Update";
  const displayEntries = notice.entries.map((entry) => ({
    ...entry,
    isClosed: entry.status === "closed",
    isVariable: entry.status === "varies",
    badgeText: entry.badge,
  }));

  if (variant === "card") {
    return (
      <div
        className={cn(
          "card overflow-hidden",
          className
        )}
      >
        <div className="paper relative overflow-hidden px-5 py-6 text-sm sm:px-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300 shadow-soft">
              <CalendarClock className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">{noticeLabel}</p>
              <p className="h-card text-balance text-[1.3rem]">{notice.title}</p>
            </div>
          </div>

          <p className="mb-5 text-[15px] leading-relaxed text-ink-soft">{notice.description}</p>

          <ul className="space-y-3">
            {displayEntries.map((entry) => {
              return (
                <li
                  key={entry.day}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border px-4 py-3",
                    entry.isClosed
                      ? "border-gold-300 bg-gold-200/40"
                      : entry.isVariable
                        ? "border-evergreen-200 bg-evergreen-50/80"
                        : "border-cream-300/80 bg-white/80"
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-0 h-full w-1",
                      entry.isClosed
                        ? "bg-gold-500"
                        : entry.isVariable
                          ? "bg-evergreen-500"
                          : "bg-evergreen-200"
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="font-semibold text-ink">{entry.day}</span>
                    <span
                      className={cn(
                        "sm:text-right",
                        entry.isClosed
                          ? "font-semibold text-gold-700"
                          : entry.isVariable
                            ? "font-semibold text-evergreen-800"
                            : "text-ink-soft"
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
                          ? "border-gold-300 bg-gold-200/60 text-gold-700"
                          : entry.isVariable
                            ? "border-evergreen-200 bg-evergreen-50 text-evergreen-800"
                            : "border-cream-300 bg-cream-100 text-ink-soft",
                      )}
                    >
                      {entry.badgeText}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {notice.cta && (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={notice.cta.href}
                className="btn btn-primary btn-sm"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {notice.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              {notice.footerNote ? (
                <span className="text-xs text-ink-muted">
                  {notice.footerNote}
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
        // `relative z-10` is load-bearing: the homepage hero is a positioned
        // sibling that pulls itself up by the header height to extend its
        // gradient behind the fixed header, and without a higher stacking
        // position here it paints over the bottom of this notice.
        "relative z-10 border-b border-cream-300/80 bg-cream-50 text-ink",
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
        <div className="relative py-3 pr-11 sm:py-4 sm:pr-12 lg:py-5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute right-0 top-2 z-10 rounded-full text-ink-muted hover:bg-cream-200 hover:text-ink sm:top-3"
            aria-label="Dismiss schedule update notice"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.9fr)] lg:items-start lg:gap-8">
            <div className="min-w-0">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300 sm:flex">
                  <CalendarClock className="h-5 w-5" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                    {noticeLabel}
                  </p>
                  <h2 className="mt-1 text-balance font-heading text-lg font-medium leading-snug text-ink sm:text-xl sm:leading-tight">
                    {notice.title}
                  </h2>
                  <p className="mt-1.5 hidden max-w-2xl text-pretty text-[13px] leading-5 text-ink-soft sm:mt-2 sm:block sm:text-sm sm:leading-6">
                    {notice.summary}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2.5 sm:mt-3 sm:gap-3">
                    {notice.cta ? (
                      <Button
                        asChild
                        className="btn btn-primary btn-sm"
                      >
                        <a href={notice.cta.href}>
                          <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>Call to Confirm</span>
                          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                        </a>
                      </Button>
                    ) : null}

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowDetails((current) => !current)}
                      aria-expanded={showDetails}
                      aria-controls="holiday-hours-details"
                      className="min-h-11 rounded-full px-3 text-sm font-semibold text-ink-soft hover:bg-cream-200 hover:text-ink lg:hidden"
                    >
                      <span>{showDetails ? "Hide schedule" : "View schedule"}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform",
                          showDetails && "rotate-180",
                        )}
                        aria-hidden="true"
                      />
                    </Button>

                    {notice.footerNote ? (
                      <p className="hidden text-xs leading-5 text-ink-muted sm:block">
                        {notice.footerNote}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div
              id="holiday-hours-details"
              className={cn(
                "min-w-0 rounded-2xl border border-cream-300/80 bg-white",
                showDetails ? "block" : "hidden lg:block",
              )}
            >
              <ul className="divide-y divide-cream-300/80" aria-label="Temporary schedule details">
                {displayEntries.map((entry) => (
                  <li
                    key={entry.day}
                    className="flex items-start justify-between gap-4 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{entry.day}</p>
                      {entry.badgeText ? (
                        <p className="mt-0.5 text-xs text-ink-muted">{entry.badgeText}</p>
                      ) : null}
                    </div>

                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                        entry.isClosed
                          ? "bg-gold-200 text-gold-700"
                          : entry.isVariable
                            ? "bg-evergreen-50 text-evergreen-800"
                            : "bg-cream-200 text-ink-soft",
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
