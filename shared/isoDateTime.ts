/**
 * Strict ISO 8601 DateTime helpers for JSON-LD.
 *
 * Google's DateTime fields (ProfilePage dateModified/datePublished,
 * BlogPosting dates, VideoObject uploadDate) reject date-only values and
 * anything Date.parse would silently overflow (Feb 30, month 13, …).
 */

export const STRUCTURED_DATA_TIME_ZONE = "America/Los_Angeles";

const MONTH_INDEX: Readonly<Record<string, number>> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

const ISO_DATE_TIME =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/;

const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

const NAMED_DATE = /^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/;

export type CalendarDate = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0;
}

export function isValidCalendarDate(
  year: number,
  month: number,
  day: number,
): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  if (year < 1000 || year > 9999) return false;
  if (month < 1 || month > 12) return false;
  return day >= 1 && day <= daysInMonth(year, month);
}

function isValidOffset(offset: string): boolean {
  if (offset === "Z") return true;
  const hours = Number(offset.slice(1, 3));
  const minutes = Number(offset.slice(4, 6));
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return false;
  if (minutes > 59) return false;
  if (hours > 14) return false;
  return !(hours === 14 && minutes !== 0);
}

export function isValidIsoDateTime(value: string): boolean {
  const match = ISO_DATE_TIME.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  if (!isValidCalendarDate(year, month, day)) return false;
  if (hour > 23 || minute > 59 || second > 59) return false;
  return isValidOffset(match[8] ?? "");
}

export function parseCalendarDate(value: string): CalendarDate | null {
  const trimmed = value.trim();
  const iso = ISO_DATE_ONLY.exec(trimmed);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    return isValidCalendarDate(year, month, day) ? { year, month, day } : null;
  }
  const named = NAMED_DATE.exec(trimmed);
  if (!named) return null;
  const month = MONTH_INDEX[named[1].toLowerCase()];
  const day = Number(named[2]);
  const year = Number(named[3]);
  if (!month || !isValidCalendarDate(year, month, day)) return null;
  return { year, month, day };
}

function normalizeGmtOffset(raw: string): string | null {
  if (raw === "Z" || raw === "UTC" || raw === "GMT") return "+00:00";
  const match = raw
    .replace(/^(?:GMT|UTC)/, "")
    .match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (!match) return null;
  return `${match[1]}${match[2].padStart(2, "0")}:${match[3] ?? "00"}`;
}

export function formatInstantInTimeZone(
  instant: Date,
  timeZone: string = STRUCTURED_DATA_TIME_ZONE,
): string | null {
  if (Number.isNaN(instant.getTime())) return null;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(instant).map((part) => [part.type, part.value]),
  );
  const offset = normalizeGmtOffset(parts.timeZoneName ?? "");
  if (!offset) return null;
  const iso = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
  return isValidIsoDateTime(iso) ? iso : null;
}

function pacificOffsetAtLocalMidnight(
  date: CalendarDate,
): "-08:00" | "-07:00" | null {
  const ymd = `${date.year}-${pad2(date.month)}-${pad2(date.day)}`;
  for (const offset of ["-08:00", "-07:00"] as const) {
    const instant = new Date(`${ymd}T00:00:00${offset}`);
    const formatted = formatInstantInTimeZone(instant);
    if (formatted === `${ymd}T00:00:00${offset}`) {
      return offset;
    }
  }
  return null;
}

export function toPacificDateTime(value: string): string | null {
  const trimmed = value.trim();
  if (isValidIsoDateTime(trimmed)) return trimmed;
  const calendar = parseCalendarDate(trimmed);
  if (!calendar) return null;
  const offset = pacificOffsetAtLocalMidnight(calendar);
  if (!offset) return null;
  return `${calendar.year}-${pad2(calendar.month)}-${pad2(calendar.day)}T00:00:00${offset}`;
}

export function unixSecondsToIsoDateTime(seconds: number): string | null {
  if (!Number.isInteger(seconds) || seconds <= 0) return null;
  return formatInstantInTimeZone(new Date(seconds * 1000));
}

/** Date-only (YYYY-MM-DD) for lastmod/sitemaps — never Date.parse. */
export function toIsoDateString(value: string): string | null {
  const trimmed = value.trim();
  if (isValidIsoDateTime(trimmed)) return trimmed.slice(0, 10);
  const calendar = parseCalendarDate(trimmed);
  if (!calendar) return null;
  return `${calendar.year}-${pad2(calendar.month)}-${pad2(calendar.day)}`;
}
