"use client";

// Invite-only, noindex campaign form (Formspree ops). Fields, names, and
// submission behavior are unchanged; only the presentation moved to Rooted.
import { useState } from "react";
import { CalendarDays, Camera, CheckCircle, Clock, Sparkles } from "lucide-react";
import OfficeHoursSummary from "@/components/common/OfficeHoursSummary";
import { BtnLink } from "@/components/ds/BtnLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { officeInfo } from "@/lib/data";
import {
  FORMSPREE_OPS_QA_FIELD,
  FORMSPREE_OPS_SCHEDULE_FORM_KEY,
  FORMSPREE_OPS_SITE,
  getPublicFormspreeEndpoint,
} from "@shared/formspree";

const WEEKDAY_TIME_WINDOWS = [
  { value: "8:00 AM - 9:00 AM", label: "8:00 AM - 9:00 AM" },
  { value: "9:00 AM - 10:00 AM", label: "9:00 AM - 10:00 AM" },
  { value: "10:00 AM - 11:00 AM", label: "10:00 AM - 11:00 AM" },
  { value: "11:00 AM - 12:00 PM", label: "11:00 AM - 12:00 PM" },
  { value: "12:00 PM - 1:00 PM", label: "12:00 PM - 1:00 PM" },
  { value: "1:00 PM - 2:00 PM", label: "1:00 PM - 2:00 PM" },
  { value: "2:00 PM - 3:00 PM", label: "2:00 PM - 3:00 PM" },
  { value: "3:00 PM - 4:00 PM", label: "3:00 PM - 4:00 PM" },
  { value: "4:00 PM - 5:00 PM", label: "4:00 PM - 5:00 PM" },
];

const WEDNESDAY_TIME_WINDOWS = WEEKDAY_TIME_WINDOWS.slice(0, 7);
const FRIDAY_TIME_WINDOWS = WEEKDAY_TIME_WINDOWS.slice(0, 8);

const selectClassName =
  "h-12 w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-base text-ink ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-cream-100 disabled:text-ink-muted md:text-sm";

const inputClassName = "h-12 rounded-xl border-cream-300 bg-white";

const FORM_ENDPOINT = getPublicFormspreeEndpoint();
const FORMSPREE_OPS_UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

function appendFormspreeOpsMetadata(formData: FormData) {
  formData.set("site", FORMSPREE_OPS_SITE);
  formData.set("form_key", FORMSPREE_OPS_SCHEDULE_FORM_KEY);
  formData.set("environment", process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? "production");
  formData.set(FORMSPREE_OPS_QA_FIELD, "false");

  const params = new URLSearchParams(window.location.search);
  formData.set("page_path", window.location.pathname);
  formData.set("referrer", document.referrer);
  for (const field of FORMSPREE_OPS_UTM_FIELDS) {
    formData.set(field, params.get(field) ?? "");
  }
}

const getDayOfWeek = (value: string): number | null => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.getDay();
};

const isWeekend = (dayOfWeek: number | null): boolean =>
  dayOfWeek === 0 || dayOfWeek === 6;

const getSpecialHoursForDate = (value: string) =>
  value
    ? officeInfo.specialOpeningHoursSpecification.find(
        (entry) => value >= entry.validFrom && value <= entry.validThrough,
      )
    : undefined;

const specialClosureMessages: Readonly<Record<string, string>> = {
  "2026-06-19":
    "Office is closed Friday, June 19, 2026 for Juneteenth. Please choose another date.",
  "2026-07-03":
    "Office is closed Friday, July 3, 2026 for the July Fourth holiday. Please choose another date.",
  "2026-09-04":
    "Office is closed Friday, September 4, 2026. Please choose another date.",
};

const getSpecialClosureMessage = (value: string): string =>
  specialClosureMessages[value] ??
  "Office is closed that day. Please choose another date.";

const isClosedHours = (hours: { opens: string; closes: string }): boolean =>
  hours.opens === "00:00" && hours.closes === "00:00";

const isLimitedHoursDate = (value: string): boolean => {
  const specialHours = getSpecialHoursForDate(value);
  return Boolean(specialHours && !isClosedHours(specialHours));
};

const parseClockToMinutes = (value: string): number | null => {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

const parseTimeLabelToMinutes = (value: string): number | null => {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  const rawHours = Number(match[1]);
  const minutes = Number(match[2]);
  if (rawHours < 1 || rawHours > 12 || minutes > 59) return null;
  const period = match[3].toUpperCase();
  const hours = period === "PM" && rawHours !== 12
    ? rawHours + 12
    : period === "AM" && rawHours === 12
      ? 0
      : rawHours;
  return hours * 60 + minutes;
};

const getWindowBounds = (value: string) => {
  const [start, end] = value.split(" - ");
  return {
    start: parseTimeLabelToMinutes(start ?? ""),
    end: parseTimeLabelToMinutes(end ?? ""),
  };
};

const formatClockLabel = (value: string): string => {
  const minutes = parseClockToMinutes(value);
  if (minutes === null) return value;
  const hours24 = Math.floor(minutes / 60);
  const minutesPart = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(minutesPart).padStart(2, "0")} ${period}`;
};

const getBaseTimeWindows = (dayOfWeek: number | null) => {
  if (dayOfWeek === 3) return WEDNESDAY_TIME_WINDOWS;
  if (dayOfWeek === 5) return FRIDAY_TIME_WINDOWS;
  if (dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 4) {
    return WEEKDAY_TIME_WINDOWS;
  }
  return [];
};

const getTimeWindowsForDate = (value: string, dayOfWeek: number | null) => {
  const baseWindows = getBaseTimeWindows(dayOfWeek);
  const specialHours = getSpecialHoursForDate(value);
  if (!specialHours) return baseWindows;
  if (isClosedHours(specialHours)) return [];

  const opens = parseClockToMinutes(specialHours.opens);
  const closes = parseClockToMinutes(specialHours.closes);
  if (opens === null || closes === null || closes <= opens) return baseWindows;

  return baseWindows.filter((window) => {
    const bounds = getWindowBounds(window.value);
    return (
      bounds.start !== null &&
      bounds.end !== null &&
      bounds.start >= opens &&
      bounds.end <= closes
    );
  });
};

const isSpecialClosedDate = (value: string): boolean => {
  const specialHours = getSpecialHoursForDate(value);
  return Boolean(specialHours && isClosedHours(specialHours));
};

const getOfficeHoursHint = (dayOfWeek: number | null, value: string) => {
  const specialHours = getSpecialHoursForDate(value);
  if (specialHours && !isClosedHours(specialHours)) {
    return `Temporary office hours are ${formatClockLabel(specialHours.opens)}-${formatClockLabel(specialHours.closes)}.`;
  }
  if (dayOfWeek === 3) return "Wednesday windows end at 3:00 PM.";
  if (dayOfWeek === 5) return "Friday windows end at 4:00 PM.";
  if (dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 4) {
    return "Select a one-hour window within office hours.";
  }
  return "Select a date to see available time windows.";
};

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

const formatDate = (value: string) => {
  if (!value) return "Not provided";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const ZoomWhiteningSchedule = () => {
  const [preferredDate1, setPreferredDate1] = useState("");
  const [preferredTime1, setPreferredTime1] = useState("");
  const [preferredDate2, setPreferredDate2] = useState("");
  const [preferredTime2, setPreferredTime2] = useState("");
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>("idle");
  const [submissionError, setSubmissionError] = useState("");

  const preferredDay1 = getDayOfWeek(preferredDate1);
  const preferredDay2 = getDayOfWeek(preferredDate2);
  const isClosedDate1 = isSpecialClosedDate(preferredDate1);
  const isClosedDate2 = isSpecialClosedDate(preferredDate2);
  const isLimitedHoursDate1 = isLimitedHoursDate(preferredDate1);
  const isLimitedHoursDate2 = isLimitedHoursDate(preferredDate2);
  const timeWindows1 = getTimeWindowsForDate(preferredDate1, preferredDay1);
  const timeWindows2 = getTimeWindowsForDate(preferredDate2, preferredDay2);
  const isWeekend1 = isWeekend(preferredDay1);
  const isWeekend2 = isWeekend(preferredDay2);

  const handlePreferredDate1Change = (value: string) => {
    const day = getDayOfWeek(value);
    const windows = getTimeWindowsForDate(value, day);
    setPreferredDate1(value);
    setPreferredTime1((current) =>
      windows.some((window) => window.value === current) ? current : "",
    );
  };

  const handlePreferredDate2Change = (value: string) => {
    const day = getDayOfWeek(value);
    const windows = getTimeWindowsForDate(value, day);
    setPreferredDate2(value);
    setPreferredTime2((current) =>
      windows.some((window) => window.value === current) ? current : "",
    );
  };

  const timePlaceholder1 = preferredDate1
    ? isWeekend1
      ? "Office is closed on weekends"
      : isClosedDate1
        ? "Office is closed that day"
      : "Select a 1-hour window"
    : "Pick a date first";
  const timePlaceholder2 = preferredDate2
    ? isWeekend2
      ? "Office is closed on weekends"
      : isClosedDate2
        ? "Office is closed that day"
      : "Select a 1-hour window"
    : "Pick a date first";

  const isSubmitting = submissionStatus === "submitting";

  const submitForm = async (form: HTMLFormElement) => {
    if (isSubmitting) return;
    setSubmissionStatus("submitting");
    setSubmissionError("");

    const formData = new FormData(form);
    appendFormspreeOpsMetadata(formData);

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setSubmissionStatus("success");
        return;
      }

      const data = await response.json().catch(() => null);
      const message =
        data?.errors
          ?.map((error: { message?: string }) => error.message)
          ?.join(", ") ?? "Something went wrong. Please try again.";
      setSubmissionError(message);
      setSubmissionStatus("error");
    } catch (error) {
      setSubmissionError("Something went wrong. Please try again.");
      setSubmissionStatus("error");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    await submitForm(form);
  };

  const renderHint = (
    value: string,
    day: number | null,
    closed: boolean,
    weekend: boolean,
    limited: boolean,
  ) =>
    closed && value ? (
      <p className="text-xs leading-5 text-rose-700">{getSpecialClosureMessage(value)}</p>
    ) : weekend && value ? (
      <p className="text-xs leading-5 text-rose-700">
        Office is closed on weekends. Please choose a weekday date.
      </p>
    ) : limited ? (
      <p className="text-xs leading-5 text-gold-700">{getOfficeHoursHint(day, value)}</p>
    ) : value ? (
      <p className="text-xs leading-5 text-ink-muted">{getOfficeHoursHint(day, value)}</p>
    ) : (
      <p className="text-xs leading-5 text-ink-muted">Select a date to see available time windows.</p>
    );

  return (
    <>
      <section className="surface-evergreen on-dark relative overflow-hidden pb-14 pt-10 sm:pb-20 sm:pt-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[url('/brand/roots-glow.svg')] bg-[length:1440px_360px] bg-[position:center_-170px] bg-no-repeat opacity-20 [mask-image:linear-gradient(to_bottom,#000,transparent)]"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <div className="lg:pt-6">
              <p className="eyebrow eyebrow-light">Invite-only scheduling</p>
              <h1 className="h-display mt-5 text-balance text-[2.3rem] sm:text-[3rem] lg:text-[3.4rem]">
                ZOOM! Whitening photo and video session
              </h1>
              <p className="lead mt-5 max-w-xl">
                This page is reserved for invited patients who are helping Dr. Wong with a marketing
                shoot. Your visit includes a complimentary in-office ZOOM! Whitening treatment while
                our team captures photos and video.
              </p>

              <ul className="mt-7 flex flex-wrap gap-2 text-sm">
                {[
                  { icon: Sparkles, label: "Complimentary whitening" },
                  { icon: Camera, label: "Photo and video capture" },
                  { icon: Clock, label: "About 90 minutes" },
                ].map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 font-medium text-cream-50"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-evergreen-100">
                <p className="font-semibold text-cream-50">Choose two times that work for you.</p>
                <p className="mt-1">
                  Pick two date and 1-hour time windows within office hours. We will confirm the best fit.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-white p-6 text-ink shadow-lift sm:p-8">
              {submissionStatus === "success" ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-evergreen-800 text-gold-300">
                      <CheckCircle className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <h2 className="mt-4 font-heading text-[1.9rem] font-medium leading-tight text-ink">Request received</h2>
                    <p className="mt-2 text-[15px] leading-7 text-ink-soft">
                      We have received your submission. Someone on the team will reach out soon to
                      coordinate next steps.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cream-300 bg-cream-50 p-4 sm:p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                      Your selected windows
                    </p>
                    <div className="mt-4 space-y-4">
                      {[
                        { label: "Preferred option 1", date: preferredDate1, time: preferredTime1 },
                        { label: "Preferred option 2", date: preferredDate2, time: preferredTime2 },
                      ].map((option) => (
                        <div key={option.label} className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-ink">{option.label}</p>
                            <p className="text-xs text-ink-muted">Date and time</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-ink">{formatDate(option.date)}</p>
                            <p className="text-xs text-ink-muted">{option.time || "Not provided"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-cream-300 bg-white p-4 text-sm">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-ink">Need to update your request?</p>
                      <p className="text-ink-soft">
                        Call us at{" "}
                        <a href={`tel:${officeInfo.phoneE164}`} className="link-rooted">
                          {officeInfo.phone}
                        </a>{" "}
                        and we will be happy to help.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-heading text-[1.9rem] font-medium leading-tight text-ink">Request your visit</h2>
                  <p className="mt-2 text-[15px] leading-7 text-ink-soft">
                    Enter your name, then select two possible 1-hour windows. All times are Pacific.
                  </p>

                  <form
                    action={FORM_ENDPOINT}
                    method="POST"
                    className="mt-6 space-y-5"
                    onSubmit={handleSubmit}
                    aria-busy={isSubmitting}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          autoComplete="given-name"
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          autoComplete="family-name"
                          required
                          className={inputClassName}
                        />
                      </div>
                    </div>

                    <fieldset className="space-y-4 rounded-2xl bg-cream-100 p-4 sm:p-5">
                      <legend className="sr-only">Preferred option 1</legend>
                      <div aria-hidden="true" className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <CalendarDays className="h-4 w-4 text-evergreen-600" />
                        Preferred option 1
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="preferredDate1">Date</Label>
                          <Input
                            id="preferredDate1"
                            name="preferredDate1"
                            type="date"
                            required
                            value={preferredDate1}
                            onChange={(event) => handlePreferredDate1Change(event.target.value)}
                            className={inputClassName}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preferredTime1">Time window (1 hour)</Label>
                          <select
                            id="preferredTime1"
                            name="preferredTime1"
                            required
                            value={preferredTime1}
                            onChange={(event) => setPreferredTime1(event.target.value)}
                            className={selectClassName}
                            disabled={!preferredDate1}
                          >
                            <option value="" disabled>
                              {timePlaceholder1}
                            </option>
                            {timeWindows1.map((window) => (
                              <option key={window.value} value={window.value}>
                                {window.label}
                              </option>
                            ))}
                          </select>
                          {renderHint(preferredDate1, preferredDay1, isClosedDate1, isWeekend1, isLimitedHoursDate1)}
                        </div>
                      </div>
                    </fieldset>

                    <fieldset className="space-y-4 rounded-2xl bg-cream-100 p-4 sm:p-5">
                      <legend className="sr-only">Preferred option 2</legend>
                      <div aria-hidden="true" className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <CalendarDays className="h-4 w-4 text-evergreen-600" />
                        Preferred option 2
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="preferredDate2">Date</Label>
                          <Input
                            id="preferredDate2"
                            name="preferredDate2"
                            type="date"
                            required
                            value={preferredDate2}
                            onChange={(event) => handlePreferredDate2Change(event.target.value)}
                            className={inputClassName}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preferredTime2">Time window (1 hour)</Label>
                          <select
                            id="preferredTime2"
                            name="preferredTime2"
                            required
                            value={preferredTime2}
                            onChange={(event) => setPreferredTime2(event.target.value)}
                            className={selectClassName}
                            disabled={!preferredDate2}
                          >
                            <option value="" disabled>
                              {timePlaceholder2}
                            </option>
                            {timeWindows2.map((window) => (
                              <option key={window.value} value={window.value}>
                                {window.label}
                              </option>
                            ))}
                          </select>
                          {renderHint(preferredDate2, preferredDay2, isClosedDate2, isWeekend2, isLimitedHoursDate2)}
                        </div>
                      </div>
                    </fieldset>

                    <div className="flex items-start gap-3 rounded-2xl border border-cream-300 bg-white p-4 text-sm">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
                      <div>
                        <p className="font-semibold text-ink">Office hours</p>
                        <OfficeHoursSummary
                          variant="inline"
                          hoursClassName="text-ink-soft"
                          noteClassName="text-ink-muted"
                        />
                      </div>
                    </div>

                    {submissionError ? (
                      <p className="text-sm text-rose-700" role="alert">
                        {submissionError}
                      </p>
                    ) : null}

                    <div className="flex flex-col gap-3">
                      <Button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit scheduling request"}
                      </Button>
                      <p className="flex items-start gap-2 text-xs leading-5 text-ink-muted">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-evergreen-600" aria-hidden="true" />
                        <span>
                          By submitting, you confirm you are comfortable with photo and video capture during your visit.
                        </span>
                      </p>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream-100 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="card mx-auto flex max-w-5xl flex-col gap-6 p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Learn more</p>
            <h2 className="h-section mt-3 text-[1.8rem] sm:text-[2.2rem]">
              See how ZOOM! <em>Whitening works</em>
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-7 text-ink-soft">
              Review the in-office process, timeline, and expected results before your visit.
            </p>
          </div>
          <BtnLink href="/teeth-whitening-palo-alto" className="w-full md:w-auto">
            Explore the ZOOM! process
          </BtnLink>
        </div>
      </section>
    </>
  );
};

export default ZoomWhiteningSchedule;
