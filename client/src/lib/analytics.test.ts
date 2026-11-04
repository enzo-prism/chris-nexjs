import assert from "assert";
import {
  ANALYTICS_EVENTS,
  getAnalyticsPageCategory,
  getAnalyticsPageContext,
  sanitizeAnalyticsEventName,
  sanitizeAnalyticsEventProperties,
  sanitizeVercelEventProperties,
} from "@shared/analytics";
import { isAllowedAnalyticsHost } from "@shared/analyticsHosts";

process.env.NEXT_PUBLIC_GOOGLE_ADS_ID = "AW-SYNTHETIC000";
const {
  getAnalyticsConsentState,
  hasAnalyticsConsent,
  isAnalyticsRuntimeEnabled,
  isAnalyticsTestHookEnabled,
  trackGAEvent,
  trackLeadConversion,
  trackVercelEvent,
} = await import("./analytics");

const waitForAnalyticsFlush = () => new Promise((resolve) => setTimeout(resolve, 50));

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

assert.equal(getAnalyticsPageCategory("/"), "home");
assert.equal(getAnalyticsPageCategory("/schedule"), "schedule");
assert.equal(getAnalyticsPageCategory("/dentist-menlo-park"), "location");
assert.deepStrictEqual(getAnalyticsPageContext("/contact"), {
  page_path: "/contact",
  page_category: "trust",
});

const sanitizedName = sanitizeAnalyticsEventName("1 bad event name with spaces");
assert.ok(sanitizedName.startsWith("event_1_bad_event_name"));
assert.ok(sanitizedName.length <= 40);

assert.deepStrictEqual(
  sanitizeAnalyticsEventProperties({
    page_path: "/contact",
    lead_type: "contact_request",
    email: "patient@example.com",
    phone_number: "6505551212",
    contact_phone: "6505551212",
    message: "Please call me",
    error_message: "User-entered details should not be sent",
    additional_notes: "Free-form notes should not be sent",
    destination_url: "https://example.com/private-path",
    full_url: "https://example.com/private-path",
    nested: { unsafe: true },
  }),
  {
    page_path: "/contact",
    lead_type: "contact_request",
  },
);

assert.deepStrictEqual(
  sanitizeVercelEventProperties(ANALYTICS_EVENTS.outboundClick, {
    page_path: "/",
    page_category: "home",
    destination_host: "maps.app.goo.gl",
    cta_context: "header",
  }),
  {
    page_path: "/",
    destination_host: "maps.app.goo.gl",
  },
);

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
trackVercelEvent(ANALYTICS_EVENTS.contactFormSubmit, {
  form_name: "contact_form",
  lead_type: "contact_request",
  page_path: "/contact",
  page_category: "trust",
});
await waitForAnalyticsFlush();
assert.deepStrictEqual(vercelCalled, [
  "event",
  {
    name: "contact_form_submit",
    data: {
      page_path: "/contact",
      lead_type: "contact_request",
    },
    options: undefined,
  },
]);

vercelCalled = null;
(globalThis as any).window.location.hostname = "localhost";
trackVercelEvent(ANALYTICS_EVENTS.contactFormSubmit, {
  form_name: "contact_form",
  lead_type: "contact_request",
  page_path: "/contact",
});
await waitForAnalyticsFlush();
assert.strictEqual(vercelCalled, null);
assert.strictEqual(isAllowedAnalyticsHost("localhost"), false);

vercelCalled = null;
(globalThis as any).window.location.hostname =
  "chris-wong-dds-git-allowlist.vercel.app";
trackVercelEvent(ANALYTICS_EVENTS.contactFormSubmit, {
  form_name: "contact_form",
  lead_type: "contact_request",
  page_path: "/contact",
});
await waitForAnalyticsFlush();
assert.strictEqual(vercelCalled, null);

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

const previousNodeEnv = process.env.NODE_ENV;
(globalThis as any).window.__cwForceAnalytics = true;
(globalThis as any).window.localStorage.value = "denied";
(globalThis as any).window.location.hostname = "localhost";
process.env.NODE_ENV = "test";
assert.equal(isAnalyticsTestHookEnabled(), true);
assert.equal(hasAnalyticsConsent(), true, "non-prod hook may override denied consent");
assert.equal(isAnalyticsRuntimeEnabled(), true);

process.env.NODE_ENV = "production";
assert.equal(isAnalyticsTestHookEnabled(), false);
assert.equal(
  hasAnalyticsConsent(),
  false,
  "production builds must not let __cwForceAnalytics override consent",
);
assert.equal(isAnalyticsRuntimeEnabled(), false);

process.env.NODE_ENV = previousNodeEnv;
delete (globalThis as any).window.__cwForceAnalytics;
(globalThis as any).window.localStorage.value = "granted";
(globalThis as any).window.location.hostname = "www.chriswongdds.com";
const leadCalls: unknown[][] = [];
(globalThis as any).window.gtag = (...args: unknown[]) => {
  leadCalls.push(args);
};
const mainLeadProperties = {
  form_name: "contact_form",
  lead_type: "contact_request",
  lead_source: "contact_form",
};
trackLeadConversion(ANALYTICS_EVENTS.contactFormSubmit, mainLeadProperties);
assert.deepStrictEqual(
  leadCalls.filter((args) => args[0] === "event" && args[1] === "contact_form_submit"),
  [["event", "contact_form_submit", mainLeadProperties]],
);
assert.deepStrictEqual(
  leadCalls.filter((args) => args[0] === "event" && args[1] === "generate_lead"),
  [["event", "generate_lead", mainLeadProperties]],
);
assert.deepStrictEqual(
  leadCalls.filter((args) => args[0] === "event" && args[1] === "conversion"),
  [["event", "conversion", { send_to: "AW-SYNTHETIC000" }]],
);

leadCalls.length = 0;
(globalThis as any).window.location.hostname = "localhost";
trackLeadConversion(ANALYTICS_EVENTS.contactFormSubmit, mainLeadProperties);
assert.deepStrictEqual(leadCalls, []);
assert.deepStrictEqual(
  leadCalls.filter((args) => args[0] === "event" && args[1] === "conversion"),
  [],
);
(globalThis as any).window.location.hostname = "chriswongdds.com.evil.com";
trackLeadConversion(ANALYTICS_EVENTS.contactFormSubmit, mainLeadProperties);
assert.deepStrictEqual(leadCalls, []);
assert.deepStrictEqual(
  leadCalls.filter((args) => args[0] === "event" && args[1] === "conversion"),
  [],
);
(globalThis as any).window.location.hostname = "evilchriswongdds.com";
trackLeadConversion(ANALYTICS_EVENTS.contactFormSubmit, mainLeadProperties);
assert.deepStrictEqual(
  leadCalls.filter((args) => args[0] === "event" && args[1] === "conversion"),
  [],
);

console.log("analytics tests passed");
