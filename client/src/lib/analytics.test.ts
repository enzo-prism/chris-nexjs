import assert from "assert";
import {
  getAnalyticsConsentState,
  hasAnalyticsConsent,
  isAnalyticsRuntimeEnabled,
  trackGAEvent,
} from "./analytics";

let called: any = null;
(globalThis as any).window = {
  gtag: (...args: any[]) => {
    called = args;
  },
  location: {
    hostname: "www.chriswongdds.com",
  },
  localStorage: {
    value: "granted",
    getItem(key: string) {
      return key === "analytics_consent" ? this.value : null;
    },
    setItem(key: string, value: string) {
      if (key === "analytics_consent") {
        this.value = value;
      }
    },
  },
};

trackGAEvent("test_action", { a: 1 });
assert.deepStrictEqual(called, ["event", "test_action", { a: 1 }]);
assert.strictEqual(getAnalyticsConsentState(), "granted");
assert.strictEqual(hasAnalyticsConsent(), true);
assert.strictEqual(isAnalyticsRuntimeEnabled(), true);

called = null;
(globalThis as any).window.localStorage.value = "denied";
trackGAEvent("blocked_action", { blocked: true });
assert.strictEqual(called, null);
assert.strictEqual(getAnalyticsConsentState(), "denied");
assert.strictEqual(hasAnalyticsConsent(), false);

called = null;
(globalThis as any).window.localStorage.value = "granted";
(globalThis as any).window.location.hostname = "localhost";
trackGAEvent("local_action", { local: true });
assert.strictEqual(called, null);
assert.strictEqual(isAnalyticsRuntimeEnabled(), false);

// ensure no error when gtag is missing
called = null;
delete (globalThis as any).window.gtag;
trackGAEvent("no_gtag");
assert.strictEqual(called, null);

console.log("analytics tests passed");
