import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatInstantInTimeZone,
  isValidIsoDateTime,
  parseCalendarDate,
  toIsoDateString,
  toPacificDateTime,
  unixSecondsToIsoDateTime,
} from "./isoDateTime";

describe("isValidIsoDateTime", () => {
  it("accepts a full DateTime with an explicit offset or Z", () => {
    assert.equal(isValidIsoDateTime("2026-10-28T00:00:00-07:00"), true);
    assert.equal(isValidIsoDateTime("2026-10-16T09:00:00-07:00"), true);
    assert.equal(isValidIsoDateTime("2026-06-23T00:00:00Z"), true);
    assert.equal(isValidIsoDateTime("2024-02-29T12:30:00+00:00"), true);
    assert.equal(isValidIsoDateTime("2026-03-08T00:00:00.123-08:00"), true);
  });

  it("rejects date-only, missing offset, and abbreviated times", () => {
    assert.equal(isValidIsoDateTime("2026-10-28"), false);
    assert.equal(isValidIsoDateTime("2026-10-28T00:00:00"), false);
    assert.equal(isValidIsoDateTime("2026-10-28T00:00Z"), false);
    assert.equal(isValidIsoDateTime("2026-10-28 00:00:00Z"), false);
    assert.equal(isValidIsoDateTime("October 28, 2026"), false);
  });

  it("rejects impossible calendar dates and out-of-range times", () => {
    assert.equal(isValidIsoDateTime("2026-02-30T00:00:00Z"), false);
    assert.equal(isValidIsoDateTime("2026-13-01T00:00:00Z"), false);
    assert.equal(isValidIsoDateTime("2026-11-31T00:00:00-08:00"), false);
    assert.equal(isValidIsoDateTime("2025-02-29T00:00:00Z"), false);
    assert.equal(isValidIsoDateTime("2026-10-28T25:00:00Z"), false);
    assert.equal(isValidIsoDateTime("2026-10-28T00:60:00Z"), false);
    assert.equal(isValidIsoDateTime("2026-10-28T00:00:60Z"), false);
    assert.equal(isValidIsoDateTime("2026-10-28T00:00:00-99:00"), false);
  });

  it("rejects hour 24, a naive leap day, lowercase z, and multiline values", () => {
    assert.equal(isValidIsoDateTime("2026-10-28T24:00:00Z"), false);
    assert.equal(
      isValidIsoDateTime("1900-02-29T00:00:00Z"),
      false,
      "1900 is not a leap year (naive year%4 would accept it)",
    );
    assert.equal(isValidIsoDateTime("2000-02-29T12:00:00Z"), true);
    assert.equal(isValidIsoDateTime("2026-06-23T00:00:00z"), false);
    assert.equal(isValidIsoDateTime("2026-06-23T00:00:00Z\n"), false);
    assert.equal(isValidIsoDateTime("\n2026-06-23T00:00:00Z"), false);
    assert.equal(
      isValidIsoDateTime("2026-06-23T00:00:00Z\n2026-06-24T00:00:00Z"),
      false,
    );
  });
});

describe("parseCalendarDate", () => {
  it("parses ISO date-only and Month D, YYYY without Date.parse overflow", () => {
    assert.deepEqual(parseCalendarDate("2026-03-29"), {
      year: 2026,
      month: 3,
      day: 29,
    });
    assert.deepEqual(parseCalendarDate("March 29, 2026"), {
      year: 2026,
      month: 3,
      day: 29,
    });
    assert.equal(parseCalendarDate("2026-02-30"), null);
    assert.equal(parseCalendarDate("February 30, 2026"), null);
    assert.equal(parseCalendarDate("13/40/2026"), null);
  });
});

describe("toPacificDateTime", () => {
  it("keeps an already-valid DateTime", () => {
    assert.equal(
      toPacificDateTime("2026-10-16T09:00:00-07:00"),
      "2026-10-16T09:00:00-07:00",
    );
    assert.equal(
      toPacificDateTime("  2026-10-16T09:00:00-07:00  "),
      "2026-10-16T09:00:00-07:00",
    );
  });

  it("trims date-only input before expanding to midnight Pacific", () => {
    assert.equal(toPacificDateTime("  2026-06-23  "), "2026-06-23T00:00:00-07:00");
    assert.equal(toPacificDateTime("  March 29, 2026  "), "2026-03-29T00:00:00-07:00");
  });

  it("expands date-only and named dates to midnight Pacific with the DST offset", () => {
    assert.equal(toPacificDateTime("2026-06-23"), "2026-06-23T00:00:00-07:00");
    assert.equal(toPacificDateTime("March 29, 2026"), "2026-03-29T00:00:00-07:00");
    assert.equal(
      toPacificDateTime("November 20, 2025"),
      "2025-11-20T00:00:00-08:00",
    );
    // DST starts 2026-03-08 at 02:00, so local midnight is still PST.
    assert.equal(toPacificDateTime("2026-03-08"), "2026-03-08T00:00:00-08:00");
    // DST ends 2026-11-01 at 02:00, so local midnight is still PDT.
    assert.equal(toPacificDateTime("2026-11-01"), "2026-11-01T00:00:00-07:00");
  });

  it("returns null for impossible or unparseable values", () => {
    assert.equal(toPacificDateTime("2026-02-30"), null);
    assert.equal(toPacificDateTime("not a date"), null);
    assert.equal(toPacificDateTime("2026-10-28T00:00:00"), null);
  });
});

describe("unixSecondsToIsoDateTime", () => {
  it("emits a full Pacific DateTime from a Cloudinary version timestamp", () => {
    const iso = unixSecondsToIsoDateTime(1772057711);
    assert.equal(iso, "2026-02-25T14:15:11-08:00");
    assert.equal(isValidIsoDateTime(iso ?? ""), true);
  });

  it("rejects non-positive or non-integer timestamps", () => {
    assert.equal(unixSecondsToIsoDateTime(0), null);
    assert.equal(unixSecondsToIsoDateTime(-1), null);
    assert.equal(unixSecondsToIsoDateTime(1772057711.5), null);
  });
});

describe("toIsoDateString", () => {
  it("returns a calendar date without using Date.parse overflow", () => {
    assert.equal(toIsoDateString("March 29, 2026"), "2026-03-29");
    assert.equal(toIsoDateString("2026-10-28T00:00:00-07:00"), "2026-10-28");
    assert.equal(toIsoDateString("2026-02-30"), null);
  });
});

describe("formatInstantInTimeZone without longOffset", () => {
  const OriginalDateTimeFormat = Intl.DateTimeFormat;

  function installStub(
    impl: (
      locales?: string | string[],
      options?: Intl.DateTimeFormatOptions,
    ) => Intl.DateTimeFormat,
  ): () => void {
    const Stub = function (
      this: unknown,
      locales?: string | string[],
      options?: Intl.DateTimeFormatOptions,
    ) {
      return impl(locales, options);
    } as unknown as typeof Intl.DateTimeFormat;
    Object.defineProperty(Stub, "supportedLocalesOf", {
      value: OriginalDateTimeFormat.supportedLocalesOf.bind(OriginalDateTimeFormat),
    });
    Intl.DateTimeFormat = Stub;
    return () => {
      Intl.DateTimeFormat = OriginalDateTimeFormat;
    };
  }

  it("still formats when longOffset is rejected", () => {
    const restore = installStub((locales, options) => {
      if (options?.timeZoneName === "longOffset") {
        throw new RangeError("Invalid option : longOffset");
      }
      return new OriginalDateTimeFormat(locales, options);
    });
    try {
      const iso = formatInstantInTimeZone(new Date(1772057711 * 1000));
      assert.equal(iso, "2026-02-25T14:15:11-08:00");
      assert.equal(toPacificDateTime("2026-06-23"), "2026-06-23T00:00:00-07:00");
      assert.equal(unixSecondsToIsoDateTime(1772057711), "2026-02-25T14:15:11-08:00");
    } finally {
      restore();
    }
  });

  it("returns null instead of throwing when Intl.DateTimeFormat is unavailable", () => {
    const restore = installStub(() => {
      throw new RangeError("Intl.DateTimeFormat is broken");
    });
    try {
      assert.equal(formatInstantInTimeZone(new Date(1772057711 * 1000)), null);
      assert.equal(
        toPacificDateTime("2026-10-16T09:00:00-07:00"),
        "2026-10-16T09:00:00-07:00",
      );
    } finally {
      restore();
    }
  });
});
