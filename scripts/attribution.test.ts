import assert from "node:assert/strict";

import {
  deriveLeadChannel,
  describeLeadAttribution,
  pickUtmParams,
} from "../shared/attribution";
import { leadAttributionSchema } from "../shared/attributionSchema";
import { ANALYTICS_EVENTS, sanitizeVercelEventProperties } from "../shared/analytics";
import { scheduleRequestV2Schema } from "../shared/scheduleRequest";

// Channel derivation: explicit tags beat referrers.
const cases: Array<[Parameters<typeof deriveLeadChannel>[0], string]> = [
  [{ utm: { utm_source: "google", utm_medium: "organic", utm_campaign: "gbp_website" } }, "google_business_profile"],
  [{ utm: { utm_source: "gbp" }, referrerHost: "www.google.com" }, "google_business_profile"],
  [{ utm: { utm_source: "google", utm_medium: "cpc" } }, "google_ads"],
  [{ hasClickId: true, referrerHost: "www.google.com" }, "google_ads"],
  [{ utm: { utm_source: "demandforce" } }, "email"],
  [{ utm: { utm_source: "newsletter", utm_medium: "email" } }, "email"],
  [{ utm: { utm_source: "flyer" } }, "campaign"],
  [{ referrerHost: "www.google.com" }, "google_organic"],
  [{ referrerHost: "www.google.co.uk" }, "google_organic"],
  [{ referrerHost: "gemini.google.com" }, "ai_assistant"],
  [{ referrerHost: "chatgpt.com" }, "ai_assistant"],
  [{ referrerHost: "duckduckgo.com" }, "other_search"],
  [{ referrerHost: "l.instagram.com" }, "social"],
  [{ referrerHost: "m.yelp.com" }, "yelp"],
  [{ referrerHost: "local.demandforce.com" }, "email"],
  [{ referrerHost: "example-blog.com" }, "referral"],
  [{}, "direct"],
];
for (const [input, expected] of cases) {
  assert.equal(deriveLeadChannel(input), expected, JSON.stringify(input));
}

// Only utm_* keys survive, trimmed and bounded.
assert.deepEqual(
  pickUtmParams(new URLSearchParams("utm_source=gbp&utm_campaign=gbp_website&gclid=abc&email=x")),
  { utm_source: "gbp", utm_campaign: "gbp_website" },
);

assert.equal(
  describeLeadAttribution({ channel: "google_business_profile", landingPath: "/", referrerHost: "www.google.com" }),
  "Google Business Profile · landed on / · via www.google.com",
);
assert.equal(describeLeadAttribution(undefined), "Unknown");

// Attribution rejects unknown channels and oversized values.
assert.equal(leadAttributionSchema.safeParse({ channel: "billboard" }).success, false);
assert.equal(
  leadAttributionSchema.safeParse({ channel: "direct", landingPath: "/".repeat(201) }).success,
  false,
);

// The schedule wire schema accepts (and does not require) attribution.
const baseRequest = {
  firstName: "Test",
  lastName: "Patient",
  phone: "6505550100",
  appointmentType: "New Patient Exam & Cleaning",
  schedulingMode: "first_available",
  contactPreference: "phone",
};
assert.equal(scheduleRequestV2Schema.safeParse(baseRequest).success, true);
const withAttribution = scheduleRequestV2Schema.safeParse({
  ...baseRequest,
  attribution: { channel: "google_business_profile", landingPath: "/" },
});
assert.equal(withAttribution.success, true);
assert.equal(
  withAttribution.success && withAttribution.data.attribution?.channel,
  "google_business_profile",
);

// Vercel custom events keep the lead channel when present and fall back to
// the previous dimensions when it is not.
assert.deepEqual(
  sanitizeVercelEventProperties(ANALYTICS_EVENTS.appointmentRequestSubmit, {
    lead_channel: "google_business_profile",
    appointment_type: "Invisalign Consultation",
    page_path: "/schedule",
  }),
  { lead_channel: "google_business_profile", appointment_type: "Invisalign Consultation" },
);
assert.deepEqual(
  sanitizeVercelEventProperties(ANALYTICS_EVENTS.appointmentRequestSubmit, {
    appointment_type: "Invisalign Consultation",
    page_path: "/schedule",
  }),
  { appointment_type: "Invisalign Consultation", page_path: "/schedule" },
);

console.log(`Lead attribution checks passed (${cases.length} channel cases).`);
