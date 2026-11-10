import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANALYTICS_ALLOWED_HOSTS,
  analyticsHostAllowlistGuardSnippet,
  canSendServerAnalytics,
  hostnameFromRequestHeaders,
  isAllowedAnalyticsHost,
  isProductionAnalyticsHost,
  normalizeAnalyticsHostname,
} from "./analyticsHosts";

type GuardEval = {
  result: unknown;
  gtagType: string;
  threw: boolean;
  dataLayerDefined: boolean;
};

function evalHostGuardState(
  hostname: string | undefined,
  hideLocation = false,
): GuardEval {
  const snippet = analyticsHostAllowlistGuardSnippet();
  const body = `
    "use strict";
    const window = {};
    const location = ${hideLocation ? "undefined" : "{ hostname }"};
    let result;
    let threw = false;
    try {
      result = (function () {
        ${snippet}
        return "loaded";
      })();
      if (typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", { lead_type: "synthetic" });
        window.gtag("config", "G-94WRBJY51J");
      }
    } catch (_error) {
      threw = true;
    }
    return {
      result,
      gtagType: typeof window.gtag,
      threw,
      dataLayerDefined: Object.prototype.hasOwnProperty.call(window, "dataLayer"),
    };
  `;
  const run = new Function("hostname", body);
  return run(hostname) as GuardEval;
}

function evalHostGuard(hostname: string | undefined, hideLocation = false): unknown {
  return evalHostGuardState(hostname, hideLocation).result;
}

describe("ANALYTICS_ALLOWED_HOSTS", () => {
  it("is only the two production hostnames", () => {
    assert.deepEqual([...ANALYTICS_ALLOWED_HOSTS].sort(), [
      "chriswongdds.com",
      "www.chriswongdds.com",
    ]);
  });
});

describe("isProductionAnalyticsHost", () => {
  it("is the same exact-allowlist helper as isAllowedAnalyticsHost", () => {
    assert.equal(isAllowedAnalyticsHost, isProductionAnalyticsHost);
  });

  it("allows only the two production hosts and blocks every other case in the spec", () => {
    const cases: ReadonlyArray<readonly [string, boolean]> = [
      ["chriswongdds.com", true],
      ["www.chriswongdds.com", true],
      ["localhost", false],
      ["127.0.0.1", false],
      ["chris-wong-dds-git-allowlist.vercel.app", false],
      ["chriswongdds.com.evil.com", false],
      ["sub.chriswongdds.com", false],
      ["", false],
    ];

    for (const [hostname, allowed] of cases) {
      assert.equal(
        isProductionAnalyticsHost(hostname),
        allowed,
        hostname,
      );
    }
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
    assert.equal(isAllowedAnalyticsHost("::1"), false);
    assert.equal(isAllowedAnalyticsHost("chris-nextjs.vercel.app"), false);
    assert.equal(isAllowedAnalyticsHost("chriswongdds.vercel.app"), false);
    assert.equal(isAllowedAnalyticsHost("preview.chriswongdds.com"), false);
    assert.equal(isAllowedAnalyticsHost("sub.chriswongdds.com"), false);
    assert.equal(isAllowedAnalyticsHost("www.chriswongdds.com.evil.com"), false);
    assert.equal(isAllowedAnalyticsHost("chriswongdds.com."), false);
    assert.equal(isAllowedAnalyticsHost("com"), false);
    assert.equal(isAllowedAnalyticsHost("wongdds.com"), false);
    assert.equal(isAllowedAnalyticsHost("chriswongdds"), false);
    assert.equal(isAllowedAnalyticsHost("www"), false);
  });

  it("fails closed when the hostname cannot be read", () => {
    assert.equal(isAllowedAnalyticsHost(""), false);
    assert.equal(isAllowedAnalyticsHost("   "), false);
    assert.equal(isAllowedAnalyticsHost(null), false);
    assert.equal(isAllowedAnalyticsHost(undefined), false);
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

  it("loads only on the two production hosts and fails closed otherwise", () => {
    assert.equal(evalHostGuard("chriswongdds.com"), "loaded");
    assert.equal(evalHostGuard("www.chriswongdds.com"), "loaded");
    assert.equal(evalHostGuard("WWW.CHRISWONGDDS.COM"), "loaded");
    assert.equal(evalHostGuard("localhost"), undefined);
    assert.equal(evalHostGuard("127.0.0.1"), undefined);
    assert.equal(evalHostGuard("chris-wong-dds-git-foo.vercel.app"), undefined);
    assert.equal(evalHostGuard("chriswongdds.com.evil.com"), undefined);
    assert.equal(evalHostGuard("evilchriswongdds.com"), undefined);
    assert.equal(evalHostGuard("preview.chriswongdds.com"), undefined);
    assert.equal(evalHostGuard("sub.chriswongdds.com"), undefined);
    assert.equal(evalHostGuard(""), undefined);
    assert.equal(evalHostGuard(undefined, true), undefined);
    assert.equal(evalHostGuard("com"), undefined);
    assert.equal(evalHostGuard("wongdds.com"), undefined);
    assert.equal(evalHostGuard("chriswongdds"), undefined);
    assert.equal(evalHostGuard("www"), undefined);
    assert.equal(evalHostGuard("chriswongdds.com."), undefined);
  });

  it("installs a no-op window.gtag on blocked hosts and does not create dataLayer", () => {
    const blocked = [
      "localhost",
      "127.0.0.1",
      "chris-wong-dds-git-foo.vercel.app",
      "chriswongdds.com.evil.com",
      "sub.chriswongdds.com",
      "",
    ];

    for (const hostname of blocked) {
      const state = evalHostGuardState(hostname);
      assert.equal(state.result, undefined, hostname);
      assert.equal(state.gtagType, "function", hostname);
      assert.equal(state.threw, false, hostname);
      assert.equal(state.dataLayerDefined, false, hostname);
    }

    const allowed = evalHostGuardState("www.chriswongdds.com");
    assert.equal(allowed.result, "loaded");
    assert.equal(allowed.gtagType, "undefined");
    assert.equal(allowed.threw, false);
    assert.equal(allowed.dataLayerDefined, false);
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
    assert.equal(canSendServerAnalytics("", previewEnv), false);
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

  it("fails closed when request headers have no host", () => {
    const hostname = hostnameFromRequestHeaders({
      get(): string | null {
        return null;
      },
    });
    assert.equal(hostname, "");
    assert.equal(
      canSendServerAnalytics(hostname, { VERCEL_URL: "www.chriswongdds.com" }),
      false,
    );
  });
});
