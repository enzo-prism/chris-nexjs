import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isBlockedGoogleMeasurementUrl } from "../tests/analytics/googleHosts";

describe("isBlockedGoogleMeasurementUrl", () => {
  it("matches GA4/GTM, ads, and pagead hosts including ccTLDs", () => {
    assert.equal(
      isBlockedGoogleMeasurementUrl("https://www.googletagmanager.com/gtag/js?id=G-TEST"),
      true,
    );
    assert.equal(
      isBlockedGoogleMeasurementUrl("https://www.google-analytics.com/g/collect"),
      true,
    );
    assert.equal(
      isBlockedGoogleMeasurementUrl("https://region1.google-analytics.com/g/collect"),
      true,
    );
    assert.equal(
      isBlockedGoogleMeasurementUrl("https://analytics.google.com/g/collect"),
      true,
    );
    assert.equal(
      isBlockedGoogleMeasurementUrl("https://www.googletagservices.com/tag/js/gpt.js"),
      true,
    );
    assert.equal(
      isBlockedGoogleMeasurementUrl("https://stats.g.doubleclick.net/g/collect"),
      true,
    );
    assert.equal(
      isBlockedGoogleMeasurementUrl("https://www.google.com/pagead/1p-user-list/123/"),
      true,
    );
    assert.equal(
      isBlockedGoogleMeasurementUrl("https://www.google.co.uk/pagead/1p-user-list/123/"),
      true,
    );
    assert.equal(
      isBlockedGoogleMeasurementUrl("https://www.google.de/pagead/1p-user-list/123/"),
      true,
    );
  });

  it("does not treat first-party or unrelated Google URLs as measurement hits", () => {
    assert.equal(isBlockedGoogleMeasurementUrl("http://localhost:3200/"), false);
    assert.equal(
      isBlockedGoogleMeasurementUrl("https://www.chriswongdds.com/schedule"),
      false,
    );
    assert.equal(
      isBlockedGoogleMeasurementUrl("https://www.google.com/maps"),
      false,
    );
    assert.equal(
      isBlockedGoogleMeasurementUrl("https://fonts.googleapis.com/css2?family=Figtree"),
      false,
    );
  });
});
