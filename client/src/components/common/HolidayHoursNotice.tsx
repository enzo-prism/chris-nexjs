import { useEffect, useState } from "react";
import { ArrowRight, CalendarCheck, CalendarClock, X } from "lucide-react";
import { holidayHours } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HolidayEntry = {
  day: string;
  hours: string;
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
      }) as HolidayEntry,
  );
  const hasClosedEntry = normalizedEntries.some((entry) =>
    entry.hours.toLowerCase().includes("closed"),
  );
  const noticeLabel = hasClosedEntry ? "Office Closed" : "Hours Update";

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
              <p className="text-lg font-semibold font-heading text-slate-900 leading-tight">{holidayHours.title}</p>
            </div>
          </div>

          <p className="text-slate-600 mb-5 leading-relaxed">{holidayHours.description}</p>

          <ul className="space-y-3">
            {normalizedEntries.map((entry, idx) => {
              const isClosed = entry.hours.toLowerCase().includes("closed");
              const isReopening = idx === normalizedEntries.length - 1 && !isClosed;
              return (
                <li
                  key={entry.day}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border px-4 py-3",
                    isClosed
                      ? "border-amber-200 bg-amber-50/70"
                      : "border-slate-200/80 bg-white/80"
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-0 h-full w-1",
                      isClosed ? "bg-amber-400" : "bg-blue-200"
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="font-semibold text-slate-900">{entry.day}</span>
                    <span
                      className={cn(
                        "sm:text-right",
                        isClosed ? "text-amber-900 font-semibold" : "text-slate-600"
                      )}
                    >
                      {entry.hours}
                    </span>
                  </div>
                  {isClosed && (
                    <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-900">
                      Closed
                    </span>
                  )}
                  {isReopening && (
                    <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700">
                      Reopens
                    </span>
                  )}
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
              <span className="text-xs text-slate-500">We’ll confirm when the office reopens.</span>
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
    <div
      className={cn(
        "border-b border-slate-200/80 bg-white/95 text-slate-700",
        "bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_50%),radial-gradient(circle_at_top_right,#fef3c7_0%,transparent_45%)]",
        className
      )}
    >
      <div
        className={cn(
          "max-w-6xl mx-auto flex flex-col gap-3 px-4 py-3 text-sm sm:px-6 lg:px-8 md:flex-row md:items-center md:gap-6",
          containerClassName
        )}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6 flex-1">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b1f3a] text-white shadow-sm ring-1 ring-white/80">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{noticeLabel}</span>
              <span className="text-sm sm:text-base font-semibold font-heading text-slate-900">
                {holidayHours.title}
              </span>
              <p className="hidden text-xs text-slate-600 sm:block sm:text-sm md:max-w-md">
                {holidayHours.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-slate-600">
            {normalizedEntries.map((entry, idx) => {
              const isClosed = entry.hours.toLowerCase().includes("closed");
              const isReopening = idx === normalizedEntries.length - 1 && !isClosed;
              const badgeColor = isClosed
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-slate-200 bg-white/80 text-slate-700";
              return (
                <span
                  key={entry.day}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border backdrop-blur",
                    badgeColor
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isClosed ? "bg-amber-500" : "bg-blue-500"
                    )}
                    aria-hidden="true"
                  />
                  {entry.day}: <span className="font-medium">{entry.hours}</span>
                  {isReopening && (
                    <span className="text-[11px] uppercase tracking-[0.18em] text-blue-700">Reopens</span>
                  )}
                </span>
              );
            })}
          </div>

          {holidayHours.cta && (
            <a
              href={holidayHours.cta.href}
              className="font-semibold inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-white shadow-sm transition hover:bg-primary/90"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              {holidayHours.cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="self-start rounded-full text-slate-500 transition hover:bg-white/70 hover:text-slate-800"
          aria-label="Dismiss holiday hours notice"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

export default HolidayHoursNotice;
