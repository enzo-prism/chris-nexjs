import assert from "assert";
import {
  getAnalyticsConsentState,
  hasAnalyticsConsent,
  isAnalyticsRuntimeEnabled,
  trackGAEvent,
  trackVercelEvent,
} from "./analytics";

const waitForAnalyticsFlush = () => new Promise((resolve) => setTimeout(resolve, 0));

let gaCalled: any = null;
let vercelCalled: any = null;
(globalThis as any).window = {
  gtag: (...args: any[]) => {
    gaCalled = args;
  },
  va: (...args: any[]) => {
    vercelCalled = args;
  },
  location: {
    hostname: "www.chriswongdds.com",
    pathname: "/",
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
assert.deepStrictEqual(gaCalled, ["event", "test_action", { a: 1 }]);
assert.strictEqual(getAnalyticsConsentState(), "granted");
assert.strictEqual(hasAnalyticsConsent(), true);
assert.strictEqual(isAnalyticsRuntimeEnabled(), true);

gaCalled = null;
(globalThis as any).window.localStorage.value = "denied";
trackGAEvent("blocked_action", { blocked: true });
assert.strictEqual(gaCalled, null);
assert.strictEqual(getAnalyticsConsentState(), "denied");
assert.strictEqual(hasAnalyticsConsent(), false);

gaCalled = null;
(globalThis as any).window.localStorage.value = "granted";
(globalThis as any).window.location.hostname = "localhost";
trackGAEvent("local_action", { local: true });
assert.strictEqual(gaCalled, null);
assert.strictEqual(isAnalyticsRuntimeEnabled(), false);

// ensure no error when gtag is missing
gaCalled = null;
delete (globalThis as any).window.gtag;
trackGAEvent("no_gtag");
assert.strictEqual(gaCalled, null);

vercelCalled = null;
(globalThis as any).window.location.hostname = "www.chriswongdds.com";
(globalThis as any).window.location.pathname = "/contact";
trackVercelEvent("contact_form_submit", {
  form_name: "contact_form",
  lead_type: "contact_request",
});
await waitForAnalyticsFlush();
assert.deepStrictEqual(vercelCalled, [
  "event",
  {
    name: "contact_form_submit",
    data: {
      form_name: "contact_form",
      lead_type: "contact_request",
    },
    options: undefined,
  },
]);

vercelCalled = null;
(globalThis as any).window.localStorage.value = "denied";
trackVercelEvent("blocked_vercel_event", {
  lead_type: "blocked",
});
await waitForAnalyticsFlush();
assert.strictEqual(vercelCalled, null);

vercelCalled = null;
(globalThis as any).window.localStorage.value = "granted";
(globalThis as any).window.location.pathname = "/analytics";
trackVercelEvent("excluded_route_event", {
  lead_type: "internal",
});
await waitForAnalyticsFlush();
assert.strictEqual(vercelCalled, null);

console.log("analytics tests passed");
