import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  displayedAggregateRating,
  fallbackGoogleReviewSnapshot,
  getResolvedGoogleReviewStats,
  googleReviewStatsCacheKey,
  isUsableRating,
  isUsableReviewCount,
  loadGoogleReviewStats,
  parsePlacesReviewFields,
  placesDetailsUrl,
  resolveGoogleReviewStats,
  withPublishedReviewCount,
} from "../shared/googlePlaceReviews";
import { getGoogleReviewStats } from "../server/googlePlaceReviews";
import {
  GOOGLE_REVIEW_COUNT,
  MAX_GOOGLE_REVIEW_COUNT,
  PUBLISHED_REVIEW_COUNT,
  PUBLISHED_REVIEW_RATING,
  REVIEW_STATS_LAST_UPDATED,
  publishedTestimonialAggregateRating,
} from "../shared/reviewStats";
import { officeInfo } from "../shared/officeInfo";

const NOW = new Date("2026-10-23T12:00:00.000Z");

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function hangingPlacesFetch(_input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return new Promise((_resolve, reject) => {
    const fail = () => {
      const error = new Error("The operation was aborted");
      error.name = "TimeoutError";
      reject(error);
    };
    const timer = setTimeout(fail, 250);
    const signal = init?.signal;
    if (!signal || signal.aborted) {
      clearTimeout(timer);
      fail();
      return;
    }
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        fail();
      },
      { once: true },
    );
  });
}

describe("committed review stats", () => {
  it("keeps the published aggregate aligned with the displayed constants", () => {
    assert.equal(publishedTestimonialAggregateRating.ratingValue, PUBLISHED_REVIEW_RATING);
    assert.equal(publishedTestimonialAggregateRating.reviewCount, PUBLISHED_REVIEW_COUNT);
    assert.equal(REVIEW_STATS_LAST_UPDATED, "2026-09-23");
    assert.ok(GOOGLE_REVIEW_COUNT > 0);
    assert.ok(PUBLISHED_REVIEW_COUNT >= GOOGLE_REVIEW_COUNT);
  });
});

describe("isUsableReviewCount", () => {
  it("accepts only finite integers between the fallback and fallback*3", () => {
    assert.equal(isUsableReviewCount(GOOGLE_REVIEW_COUNT), true);
    assert.equal(isUsableReviewCount(401), true);
    assert.equal(isUsableReviewCount(MAX_GOOGLE_REVIEW_COUNT), true);
    assert.equal(isUsableReviewCount(GOOGLE_REVIEW_COUNT - 1), false);
    assert.equal(isUsableReviewCount(MAX_GOOGLE_REVIEW_COUNT + 1), false);
    assert.equal(isUsableReviewCount(0), false);
    assert.equal(isUsableReviewCount(12.5), false);
    assert.equal(isUsableReviewCount("400"), false);
    assert.equal(isUsableReviewCount("382"), false);
    assert.equal(isUsableReviewCount(null), false);
  });
});

describe("parsePlacesReviewFields", () => {
  it("reads Places API (New) fields", () => {
    assert.deepEqual(parsePlacesReviewFields({ rating: 5, userRatingCount: 401 }), {
      ratingValue: 5,
      reviewCount: 401,
    });
  });

  it("reads legacy Place Details fields", () => {
    assert.deepEqual(
      parsePlacesReviewFields({ result: { rating: 4.9, user_ratings_total: 399 } }),
      { ratingValue: 4.9, reviewCount: 399 },
    );
  });

  it("returns null for an empty or unrelated payload", () => {
    assert.equal(parsePlacesReviewFields(null), null);
    assert.equal(parsePlacesReviewFields({}), null);
    assert.equal(parsePlacesReviewFields("nope"), null);
  });
});

describe("resolveGoogleReviewStats fallback path", () => {
  it("falls back when live data is missing", () => {
    const stats = resolveGoogleReviewStats({ live: null });
    assert.equal(stats.source, "fallback");
    assert.equal(stats.reviewCount, GOOGLE_REVIEW_COUNT);
    assert.equal(stats.ratingValue, PUBLISHED_REVIEW_RATING);
    assert.ok(stats.reviewCount > 0);
  });

  it("falls back when the live count is 0, blank, a string, or out of bounds", () => {
    const zeros = [
      { ratingValue: 5, reviewCount: 0 },
      { ratingValue: 5, reviewCount: null },
      { ratingValue: 5, reviewCount: "" },
      { ratingValue: 5, reviewCount: "400" },
      { ratingValue: 5, reviewCount: -1 },
      { ratingValue: 5, reviewCount: 12.5 },
      { ratingValue: 5, reviewCount: GOOGLE_REVIEW_COUNT - 1 },
      { ratingValue: 5, reviewCount: MAX_GOOGLE_REVIEW_COUNT + 1 },
    ];
    for (const live of zeros) {
      const stats = resolveGoogleReviewStats({ live });
      assert.equal(stats.source, "fallback", JSON.stringify(live));
      assert.equal(stats.reviewCount, GOOGLE_REVIEW_COUNT);
      assert.notEqual(stats.reviewCount, 0);
    }
  });

  it("falls back when the live rating is 0, blank, or out of range", () => {
    const badRatings = [
      { ratingValue: 0, reviewCount: 400 },
      { ratingValue: null, reviewCount: 400 },
      { ratingValue: "", reviewCount: 400 },
      { ratingValue: 6, reviewCount: 400 },
      { ratingValue: Number.NaN, reviewCount: 400 },
    ];
    for (const live of badRatings) {
      const stats = resolveGoogleReviewStats({ live });
      assert.equal(stats.source, "fallback", JSON.stringify(live));
      assert.equal(stats.ratingValue, PUBLISHED_REVIEW_RATING);
    }
  });

  it("accepts a usable live payload, uses Pacific lastUpdated, and keeps aggregateRating in lockstep", () => {
    const stats = resolveGoogleReviewStats({
      live: { ratingValue: 4.9, reviewCount: 401 },
      now: NOW,
    });
    assert.equal(stats.source, "live");
    assert.equal(stats.reviewCount, 401);
    assert.equal(stats.ratingValue, 4.9);
    assert.equal(stats.lastUpdated, "2026-10-23");
    assert.deepEqual(displayedAggregateRating(stats), {
      ratingValue: 4.9,
      reviewCount: 401,
    });
  });

  it("computes lastUpdated in America/Los_Angeles, not UTC", () => {
    // 06:30 UTC on Oct 24 is still Oct 23 in Pacific Daylight Time.
    const stats = resolveGoogleReviewStats({
      live: { ratingValue: 4.9, reviewCount: 401 },
      now: new Date("2026-10-24T06:30:00.000Z"),
    });
    assert.equal(stats.lastUpdated, "2026-10-23");
  });
});

describe("loadGoogleReviewStats fallback path", () => {
  it("returns the committed snapshot when no API key is set", async () => {
    const stats = await loadGoogleReviewStats({
      apiKey: null,
      placeId: officeInfo.googlePlaceId,
      fetchImpl: () => {
        throw new Error("fetch should not run without a key");
      },
    });
    assert.deepEqual(stats, fallbackGoogleReviewSnapshot());
    assert.ok(stats.reviewCount > 0);
  });

  it("returns the committed snapshot when the place id is blank", async () => {
    const stats = await loadGoogleReviewStats({
      apiKey: "test-key",
      placeId: "   ",
      fetchImpl: () => {
        throw new Error("fetch should not run without a place id");
      },
    });
    assert.equal(stats.source, "fallback");
    assert.equal(stats.reviewCount, GOOGLE_REVIEW_COUNT);
  });

  it("falls back when fetch throws", async () => {
    const stats = await loadGoogleReviewStats({
      apiKey: "test-key",
      placeId: officeInfo.googlePlaceId,
      fetchImpl: () => {
        throw new Error("network down");
      },
    });
    assert.equal(stats.source, "fallback");
    assert.equal(stats.reviewCount, GOOGLE_REVIEW_COUNT);
    assert.notEqual(stats.reviewCount, 0);
  });

  it("falls back on a non-OK Places response", async () => {
    const stats = await loadGoogleReviewStats({
      apiKey: "test-key",
      placeId: officeInfo.googlePlaceId,
      fetchImpl: async () => jsonResponse({ error: { message: "denied" } }, 403),
    });
    assert.equal(stats.source, "fallback");
    assert.equal(stats.reviewCount, GOOGLE_REVIEW_COUNT);
  });

  it("falls back when Places returns a 0 count", async () => {
    const stats = await loadGoogleReviewStats({
      apiKey: "test-key",
      placeId: officeInfo.googlePlaceId,
      fetchImpl: async () => jsonResponse({ rating: 5, userRatingCount: 0 }),
    });
    assert.equal(stats.source, "fallback");
    assert.equal(stats.reviewCount, GOOGLE_REVIEW_COUNT);
    assert.ok(isUsableReviewCount(stats.reviewCount));
    assert.ok(isUsableRating(stats.ratingValue));
  });

  it("falls back when a hanging Places fetch times out or aborts", async () => {
    const started = Date.now();
    const stats = await loadGoogleReviewStats({
      apiKey: "test-key",
      placeId: officeInfo.googlePlaceId,
      timeoutMs: 40,
      fetchImpl: hangingPlacesFetch,
    });
    assert.ok(Date.now() - started < 1000, "hanging fetch must not stall the render");
    assert.equal(stats.source, "fallback");
    assert.equal(stats.reviewCount, GOOGLE_REVIEW_COUNT);
  });

  it("bounds the entire Places read when response headers arrive but the body hangs", async () => {
    const stats = await Promise.race([
      loadGoogleReviewStats({
        apiKey: "test-key",
        placeId: officeInfo.googlePlaceId,
        timeoutMs: 20,
        fetchImpl: async () => ({
          ok: true,
          json: () => new Promise(() => {}),
        }) as Response,
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 250)),
    ]);
    assert.ok(stats, "a stalled response body must not stall the render");
    assert.equal(stats.source, "fallback");
    assert.equal(stats.reviewCount, GOOGLE_REVIEW_COUNT);
  });

  it("uses the live count when Places returns a usable payload", async () => {
    const stats = await loadGoogleReviewStats({
      apiKey: "test-key",
      placeId: officeInfo.googlePlaceId,
      now: NOW,
      fetchImpl: async (input) => {
        assert.equal(String(input), placesDetailsUrl(officeInfo.googlePlaceId));
        return jsonResponse({ rating: 5, userRatingCount: 405 });
      },
    });
    assert.equal(stats.source, "live");
    assert.equal(stats.reviewCount, 405);
    assert.equal(stats.ratingValue, 5);
    const published = withPublishedReviewCount(stats);
    assert.equal(published.publishedReviewCount, PUBLISHED_REVIEW_COUNT);
    assert.deepEqual(displayedAggregateRating(stats), {
      ratingValue: 5,
      reviewCount: 405,
    });
  });
});

describe("server wrapper cache policy", () => {
  it("includes the place ID in the live cache key", () => {
    assert.deepEqual(googleReviewStatsCacheKey("ChIJ-test"), [
      "google-place-review-stats",
      "ChIJ-test",
    ]);
  });

  it("does not write a fallback into the live cache", async () => {
    const writes: string[] = [];
    const stats = await getGoogleReviewStats({
      apiKey: "test-key",
      placeId: officeInfo.googlePlaceId,
      load: async () => fallbackGoogleReviewSnapshot(),
      writeLiveCache: (placeId) => {
        writes.push(placeId);
      },
    });
    assert.equal(stats.source, "fallback");
    assert.equal(stats.reviewCount, GOOGLE_REVIEW_COUNT);
    assert.deepEqual(writes, []);
  });

  it("caches only a successful live snapshot, keyed by place ID", async () => {
    const cache = new Map<string, ReturnType<typeof fallbackGoogleReviewSnapshot>>();
    const live = {
      ratingValue: 4.9,
      reviewCount: 401,
      lastUpdated: "2026-10-23",
      source: "live" as const,
    };
    const first = await getGoogleReviewStats({
      apiKey: "test-key",
      placeId: officeInfo.googlePlaceId,
      load: async () => live,
      readLiveCache: async (placeId) => cache.get(placeId) ?? null,
      writeLiveCache: (placeId, stats) => {
        cache.set(placeId, stats);
      },
    });
    assert.equal(first.source, "live");
    assert.equal(first.reviewCount, 401);
    assert.equal(cache.get(officeInfo.googlePlaceId)?.source, "live");

    let loaded = 0;
    const second = await getGoogleReviewStats({
      apiKey: "test-key",
      placeId: officeInfo.googlePlaceId,
      load: async () => {
        loaded += 1;
        return fallbackGoogleReviewSnapshot();
      },
      readLiveCache: async (placeId) => cache.get(placeId) ?? null,
    });
    assert.equal(loaded, 0);
    assert.equal(second.reviewCount, 401);
    assert.equal(second.source, "live");
  });
});
