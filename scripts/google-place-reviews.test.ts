import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  displayedAggregateRating,
  fallbackGoogleReviewSnapshot,
  isUsableRating,
  isUsableReviewCount,
  loadGoogleReviewStats,
  parsePlacesReviewFields,
  placesDetailsUrl,
  resolveGoogleReviewStats,
  withPublishedReviewCount,
} from "../shared/googlePlaceReviews";
import {
  GOOGLE_REVIEW_COUNT,
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

describe("committed review stats", () => {
  it("keeps the published aggregate aligned with the displayed constants", () => {
    assert.equal(publishedTestimonialAggregateRating.ratingValue, PUBLISHED_REVIEW_RATING);
    assert.equal(publishedTestimonialAggregateRating.reviewCount, PUBLISHED_REVIEW_COUNT);
    assert.equal(REVIEW_STATS_LAST_UPDATED, "2026-09-23");
    assert.ok(GOOGLE_REVIEW_COUNT > 0);
    assert.ok(PUBLISHED_REVIEW_COUNT >= GOOGLE_REVIEW_COUNT);
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

  it("falls back when the live count is 0, blank, or negative", () => {
    const zeros = [
      { ratingValue: 5, reviewCount: 0 },
      { ratingValue: 5, reviewCount: null },
      { ratingValue: 5, reviewCount: "" },
      { ratingValue: 5, reviewCount: -1 },
      { ratingValue: 5, reviewCount: 12.5 },
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

  it("accepts a usable live payload and keeps aggregateRating in lockstep", () => {
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
