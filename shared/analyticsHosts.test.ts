import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  ANALYTICS_ALLOWED_HOSTS,
  analyticsHostAllowlistGuardSnippet,
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

  it("is wired into the root gtag bootstrap and the other tag loaders", () => {
    const root = process.cwd();
    const layout = readFileSync(join(root, "app/layout.tsx"), "utf8");
    const hotjar = readFileSync(
      join(root, "client/src/components/common/HotjarTracking.tsx"),
      "utf8",
    );
    const vercel = readFileSync(
      join(root, "client/src/components/common/VercelAnalytics.tsx"),
      "utf8",
    );
    const runtime = readFileSync(join(root, "client/src/lib/analytics.ts"), "utf8");
    const server = readFileSync(join(root, "server/vercelAnalytics.ts"), "utf8");

    assert.match(layout, /analyticsHostAllowlistGuardSnippet/);
    assert.match(hotjar, /isAllowedAnalyticsHost/);
    assert.match(vercel, /isAllowedAnalyticsHost/);
    assert.match(runtime, /isAllowedAnalyticsHost/);
    assert.match(server, /isAllowedAnalyticsHost/);
  });
});
