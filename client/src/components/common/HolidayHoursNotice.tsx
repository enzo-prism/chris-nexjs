import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  ChevronDown,
  X,
} from "lucide-react";
import { useHolidayHours } from "@/hooks/useHolidayHours";
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
  const notice = useHolidayHours();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const dismissalKey = notice?.id
    ? `holidayHoursDismissed-${notice.id}`
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
              <p className="text-lg font-semibold font-heading text-slate-900 leading-tight text-balance">{notice.title}</p>
            </div>
          </div>

          <p className="text-slate-600 mb-5 leading-relaxed">{notice.description}</p>

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

          {notice.cta && (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={notice.cta.href}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {notice.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              {notice.footerNote ? (
                <span className="text-xs text-slate-500">
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
        "relative z-10 border-b border-slate-200 bg-white text-slate-800",
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
        <div className="relative py-3 pr-10 sm:py-4 sm:pr-12 lg:py-5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute right-0 top-2 z-10 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:top-3"
            aria-label="Dismiss schedule update notice"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.9fr)] lg:items-start lg:gap-8">
            <div className="min-w-0">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 sm:flex">
                  <CalendarClock className="h-5 w-5" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {noticeLabel}
                  </p>
                  <h2 className="mt-1 font-heading text-base font-semibold leading-snug text-slate-950 text-balance sm:text-xl sm:leading-tight">
                    {notice.title}
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-slate-600 text-pretty sm:mt-2 sm:text-sm sm:leading-6">
                    {notice.summary}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2.5 sm:mt-3 sm:gap-3">
                    {notice.cta ? (
                      <Button
                        asChild
                        className="ui-btn-primary min-h-10 rounded-full px-4 text-sm font-semibold sm:min-h-11"
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
                      className="min-h-10 rounded-full px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
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
                      <p className="hidden text-xs leading-5 text-slate-500 sm:block">
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
                "min-w-0 rounded-2xl border border-slate-200 bg-slate-50",
                showDetails ? "block" : "hidden lg:block",
              )}
            >
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
