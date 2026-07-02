export const officeInfo = {
  name: "Christopher B. Wong, DDS",
  phoneE164: "+16503266319",
  address: {
    line1: "409 Cambridge Ave",
    line2: "Palo Alto, CA 94306",
    city: "Palo Alto",
    region: "CA",
    postalCode: "94306",
    country: "US",
  },
  mapUrl: "https://maps.app.goo.gl/UCTqQ1fZsdMq7vma9",
  // Opens the Google review dialog for the practice's Business Profile
  // (place id derived from the same listing as mapUrl).
  reviewUrl:
    "https://search.google.com/local/writereview?placeid=ChIJfT983OW6j4ARMtSs-SPlX08",
  hours: {
    monday: "8:00 AM - 5:00 PM",
    tuesday: "8:00 AM - 5:00 PM",
    wednesday: "8:00 AM - 3:00 PM",
    thursday: "8:00 AM - 5:00 PM",
    friday: "8:00 AM - 4:00 PM",
    saturday: "Closed",
    sunday: "Closed",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Thursday"],
      opens: "08:00",
      closes: "17:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Wednesday",
      opens: "08:00",
      closes: "15:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "08:00",
      closes: "16:00",
    },
  ],
  specialOpeningHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "00:00",
      closes: "00:00",
      validFrom: "2026-06-19",
      validThrough: "2026-06-19",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Wednesday",
      opens: "08:00",
      closes: "15:00",
      validFrom: "2026-06-24",
      validThrough: "2026-06-24",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Thursday",
      opens: "08:00",
      closes: "15:00",
      validFrom: "2026-06-25",
      validThrough: "2026-06-25",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "08:00",
      closes: "13:00",
      validFrom: "2026-06-26",
      validThrough: "2026-06-26",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "00:00",
      closes: "00:00",
      validFrom: "2026-07-03",
      validThrough: "2026-07-03",
    },
  ],
  phone: "(650) 326-6319",
  email: "chrisbwongdds@gmail.com",
  socialMedia: {
    facebook: "https://facebook.com/drwongdental",
    twitter: "https://twitter.com/drwongdental",
    instagram: "https://www.instagram.com/dr_wong_paloalto/",
    linkedin: "https://linkedin.com/in/drchristopherwong",
  },
} as const;

export type OfficeInfo = typeof officeInfo;

const OFFICE_TIME_ZONE = "America/Los_Angeles";

/**
 * Today's calendar date in the office's timezone, as a lexicographically
 * comparable `YYYY-MM-DD` string. Computing it in a fixed timezone means the
 * server and the visitor's browser agree on the same day (the same convention
 * `OpenNowStatus` and `specialOpeningHoursSpecification` already use).
 */
export function getOfficeTodayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: OFFICE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export type HolidayHoursStatus = "closed" | "varies" | "regular";

export type HolidayHoursEntry = {
  /** Office-local ISO date (YYYY-MM-DD); the source of truth for filtering. */
  date: string;
  /** Display label, e.g. "Fri, Jun 19". */
  day: string;
  hours: string;
  status: HolidayHoursStatus;
  badge?: string;
};

/**
 * Source of truth for the temporary-hours notice. Entries are kept here in
 * full (including past dates); the visible copy is produced by
 * `resolveHolidayHours`, which prunes anything before "today". As each date
 * passes the notice updates itself with no code change — and once every entry
 * is in the past the notice disappears entirely.
 */
export const holidayHours = {
  active: true,
  id: "office-hours-2026-06-19-2026-07-03-holiday-limited-hours",
  footerNote:
    "Regular weekly hours apply outside these temporary schedule changes.",
  cta: {
    label: "Call to confirm availability",
    href: `tel:${officeInfo.phoneE164}`,
  },
  entries: [
    {
      date: "2026-06-19",
      day: "Fri, Jun 19",
      hours: "Closed",
      status: "closed",
      badge: "Juneteenth",
    },
    {
      date: "2026-06-24",
      day: "Wed, Jun 24",
      hours: "8:00 AM-3:00 PM",
      status: "varies",
      badge: "Limited hours",
    },
    {
      date: "2026-06-25",
      day: "Thu, Jun 25",
      hours: "8:00 AM-3:00 PM",
      status: "varies",
      badge: "Limited hours",
    },
    {
      date: "2026-06-26",
      day: "Fri, Jun 26",
      hours: "8:00 AM-1:00 PM",
      status: "varies",
      badge: "Limited hours",
    },
    {
      date: "2026-07-03",
      day: "Fri, Jul 3",
      hours: "Closed",
      status: "closed",
      badge: "July Fourth holiday",
    },
  ],
} as const;

export type ResolvedHolidayHours = {
  active: true;
  id: string;
  entries: HolidayHoursEntry[];
  /** e.g. "June 24 – July 3, 2026". */
  dateRange: string;
  /** Headline, e.g. "Temporary Hours: June 24 – July 3, 2026". */
  title: string;
  /** Generic, never-stale intro for the detailed card. */
  description: string;
  /** Dated one-liner for inline mentions. */
  shortNotice: string;
  /** Banner summary line. */
  summary: string;
  footerNote: string;
  cta: { label: string; href: string };
  hasClosed: boolean;
  hasVaries: boolean;
};

/** Parse a date-only ISO string without timezone drift. */
function parseEntryDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

function formatMonthDay(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
  }).format(parseEntryDate(iso));
}

function joinDayLabels(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? "";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

/**
 * Build the visible notice for a given day. Pass `null` (the pre-hydration
 * state used by `useHolidayHours`) to keep every entry so server HTML and the
 * first client render match. With a real `today`, entries before it are
 * dropped; returns `null` when the notice is inactive or nothing is upcoming.
 */
export function resolveHolidayHours(
  today: string | null = getOfficeTodayISO(),
): ResolvedHolidayHours | null {
  if (!holidayHours.active) return null;

  const allEntries = holidayHours.entries as readonly HolidayHoursEntry[];
  const entries = (
    today === null
      ? [...allEntries]
      : allEntries.filter((entry) => entry.date >= today)
  ).map((entry) => ({ ...entry }));

  if (entries.length === 0) return null;

  const closed = entries.filter((entry) => entry.status === "closed");
  const limited = entries.filter((entry) => entry.status === "varies");
  const hasClosed = closed.length > 0;
  const hasVaries = limited.length > 0;

  const firstDate = entries[0].date;
  const lastDate = entries[entries.length - 1].date;
  const year = lastDate.slice(0, 4);
  const dateRange =
    firstDate === lastDate
      ? `${formatMonthDay(firstDate)}, ${year}`
      : `${formatMonthDay(firstDate)} – ${formatMonthDay(lastDate)}, ${year}`;

  const limitedPhrase = hasVaries
    ? `limited office hours ${
        limited.length >= 2
          ? `${limited[0].day} through ${limited[limited.length - 1].day}`
          : limited[0].day
      }`
    : "";
  const closedPhrase = hasClosed
    ? `closed ${joinDayLabels(closed.map((entry) => entry.day))}`
    : "";

  let shortNotice: string;
  if (limitedPhrase && closedPhrase) {
    shortNotice = `The office will have ${limitedPhrase} and be ${closedPhrase}.`;
  } else if (limitedPhrase) {
    shortNotice = `The office will have ${limitedPhrase}.`;
  } else {
    shortNotice = `The office will be ${closedPhrase}.`;
  }

  const summary = [
    hasVaries ? "Hours may vary during this period." : null,
    hasClosed
      ? `Closed ${joinDayLabels(closed.map((entry) => entry.day))}.`
      : null,
    "Call to confirm availability before visiting.",
  ]
    .filter(Boolean)
    .join(" ");

  const description = `Our office hours are temporarily different on the dates below.${
    hasClosed ? " The office is fully closed on the highlighted holiday dates." : ""
  } Please call to confirm availability before visiting or to request an appointment.`;

  return {
    active: true,
    id: holidayHours.id,
    entries,
    dateRange,
    title: `Temporary Hours: ${dateRange}`,
    description,
    shortNotice,
    summary,
    footerNote: holidayHours.footerNote,
    cta: { ...holidayHours.cta },
    hasClosed,
    hasVaries,
  };
}
