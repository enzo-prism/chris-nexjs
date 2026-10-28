import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { GoogleReviewProof } from "../client/src/components/reviews/GoogleReviewProof";
import { ReviewStatsProvider } from "../client/src/components/reviews/ReviewStatsProvider";
import { REVIEW_COUNT_SURFACES } from "../client/src/components/reviews/reviewCountSurfaces";
import { loadGoogleReviewStats, withPublishedReviewCount } from "../shared/googlePlaceReviews";
import {
  GOOGLE_REVIEW_COUNT,
  googleReviewProofLabel,
  type PublishedReviewStats,
} from "../shared/reviewStats";

function hangingPlacesFetch(_input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return new Promise((_resolve, reject) => {
    const fail = () => {
      const error = new Error("The operation was aborted");
      error.name = "AbortError";
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

const LIVE_STATS: PublishedReviewStats = {
  ratingValue: 4.9,
  reviewCount: 401,
  lastUpdated: "2026-10-23",
  source: "live",
  publishedReviewCount: 392,
};

describe("review count surfaces share one resolved snapshot", () => {
  it("keeps every listed site on GoogleReviewProof and off GOOGLE_REVIEW_COUNT", () => {
    for (const surface of REVIEW_COUNT_SURFACES) {
      const source = readFileSync(surface.file, "utf8");
      assert.match(
        source,
        /GoogleReviewProof/,
        `${surface.file} must render GoogleReviewProof`,
      );
      assert.match(
        source,
        new RegExp(`surface="${surface.id}"`),
        `${surface.file} must declare surface="${surface.id}"`,
      );
      assert.doesNotMatch(
        source,
        /GOOGLE_REVIEW_COUNT/,
        `${surface.file} must not import GOOGLE_REVIEW_COUNT`,
      );
    }
  });

  it("renders the same live count on every surface and never says Five stars", () => {
    const html = renderToStaticMarkup(
      <ReviewStatsProvider value={LIVE_STATS}>
        {REVIEW_COUNT_SURFACES.map((surface) => (
          <GoogleReviewProof key={surface.id} surface={surface.id} variant={surface.variant} />
        ))}
      </ReviewStatsProvider>,
    );

    const counts = [...html.matchAll(/data-review-count="(\d+)"/g)].map((match) => match[1]);
    assert.equal(counts.length, REVIEW_COUNT_SURFACES.length);
    assert.ok(
      counts.every((count) => count === "401"),
      `surfaces showed ${counts.join(", ")}`,
    );
    assert.doesNotMatch(html, /data-review-count="382"/);
    assert.doesNotMatch(html, /Five stars/);
    assert.match(html, /4\.9 from 401 Google reviews/);
    assert.equal(googleReviewProofLabel(LIVE_STATS), "4.9 from 401 Google reviews");
  });

  it("completes a hanging Places read and still renders the fallback count", async () => {
    const started = Date.now();
    const stats = await loadGoogleReviewStats({
      apiKey: "test-key",
      placeId: "ChIJ-hang",
      timeoutMs: 40,
      fetchImpl: hangingPlacesFetch,
    });
    assert.ok(Date.now() - started < 1000);
    assert.equal(stats.source, "fallback");

    const html = renderToStaticMarkup(
      <ReviewStatsProvider value={withPublishedReviewCount(stats)}>
        {REVIEW_COUNT_SURFACES.map((surface) => (
          <GoogleReviewProof key={surface.id} surface={surface.id} variant={surface.variant} />
        ))}
      </ReviewStatsProvider>,
    );
    const counts = [...html.matchAll(/data-review-count="(\d+)"/g)].map((match) => match[1]);
    assert.ok(counts.every((count) => count === String(GOOGLE_REVIEW_COUNT)));
    assert.match(html, /Five stars/);
    assert.match(html, new RegExp(`${GOOGLE_REVIEW_COUNT} five-star Google reviews`));
  });
});
