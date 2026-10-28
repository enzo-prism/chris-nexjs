import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANALYTICS_ALLOWED_HOSTS,
  analyticsHostAllowlistGuardSnippet,
  canSendServerAnalytics,
  hostnameFromRequestHeaders,
  isAllowedAnalyticsHost,
  normalizeAnalyticsHostname,
} from "./analyticsHosts";

describe("ANALYTICS_ALLOWED_HOSTS", () => {
  it("is only the two production hostnames", () => {
    assert.deepEqual([...ANALYTICS_ALLOWED_HOSTS].sort(), [
      "chriswongdds.com",
      "www.chriswongdds.com",
    ]);
  });
});

describe("isAllowedAnalyticsHost", () => {
  it("allows the production hosts", () => {
    assert.equal(isAllowedAnalyticsHost("chriswongdds.com"), true);
    assert.equal(isAllowedAnalyticsHost("www.chriswongdds.com"), true);
  });

  it("allows production hosts regardless of case or a trailing port", () => {
    assert.equal(isAllowedAnalyticsHost("WWW.CHRISWONGDDS.COM"), true);
    assert.equal(isAllowedAnalyticsHost("www.chriswongdds.com:443"), true);
  });

  it("rejects localhost, a vercel.app preview, and lookalike hosts", () => {
    assert.equal(isAllowedAnalyticsHost("localhost"), false);
    assert.equal(
      isAllowedAnalyticsHost("chris-wong-dds-git-allowlist.vercel.app"),
      false,
    );
    assert.equal(isAllowedAnalyticsHost("chriswongdds.com.evil.com"), false);
    assert.equal(isAllowedAnalyticsHost("evilchriswongdds.com"), false);
  });

  it("rejects other non-production hosts that used to be allowlisted", () => {
    assert.equal(isAllowedAnalyticsHost("127.0.0.1"), false);
    assert.equal(isAllowedAnalyticsHost("chris-nextjs.vercel.app"), false);
    assert.equal(isAllowedAnalyticsHost("chriswongdds.vercel.app"), false);
    assert.equal(isAllowedAnalyticsHost("preview.chriswongdds.com"), false);
    assert.equal(isAllowedAnalyticsHost("www.chriswongdds.com.evil.com"), false);
  });
});

describe("normalizeAnalyticsHostname", () => {
  it("lowercases and strips a trailing :port without substring tricks", () => {
    assert.equal(
      normalizeAnalyticsHostname(" WWW.CHRISWONGDDS.COM:443 "),
      "www.chriswongdds.com",
    );
    assert.equal(normalizeAnalyticsHostname("localhost:3000"), "localhost");
    assert.equal(
      normalizeAnalyticsHostname("chriswongdds.com.evil.com"),
      "chriswongdds.com.evil.com",
    );
  });
});

describe("analyticsHostAllowlistGuardSnippet", () => {
  it("embeds the exact allowlist and an indexOf hostname check", () => {
    const snippet = analyticsHostAllowlistGuardSnippet();
    assert.match(snippet, /chriswongdds\.com/);
    assert.match(snippet, /www\.chriswongdds\.com/);
    assert.match(snippet, /indexOf/);
    assert.doesNotMatch(snippet, /endsWith|includes\(|indexOf\("/);
  });
});

describe("canSendServerAnalytics", () => {
  it("ignores VERCEL_URL and lets the request host decide", () => {
    const previewEnv = { VERCEL_URL: "chris-wong-dds-git-foo.vercel.app" };

    assert.equal(
      canSendServerAnalytics("chris-wong-dds-git-foo.vercel.app", previewEnv),
      false,
    );
    assert.equal(canSendServerAnalytics("localhost", previewEnv), false);
    assert.equal(canSendServerAnalytics("www.chriswongdds.com", previewEnv), true);
    assert.equal(canSendServerAnalytics("chriswongdds.com", previewEnv), true);
    assert.equal(canSendServerAnalytics("www.chriswongdds.com", {}), false);
  });

  it("prefers Host over a spoofable x-forwarded-host", () => {
    const headers = {
      get(name: string): string | null {
        if (name === "host") return "chris-wong-dds-git-foo.vercel.app";
        if (name === "x-forwarded-host") return "www.chriswongdds.com";
        return null;
      },
    };

    const hostname = hostnameFromRequestHeaders(headers);
    assert.equal(hostname, "chris-wong-dds-git-foo.vercel.app");
    assert.equal(
      canSendServerAnalytics(hostname, { VERCEL_URL: "chris-wong-dds-git-foo.vercel.app" }),
      false,
    );
  });
});
