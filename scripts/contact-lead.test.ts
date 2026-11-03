import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ANALYTICS_EVENTS } from "../shared/analytics";
import {
  CONTACT_FORM_NAME,
  CONTACT_GENERATE_LEAD_FORM_NAME,
  resolveContactLeadEvents,
} from "../client/src/lib/contactLead";

const acceptedInput = {
  accepted: true,
  leadChannel: "direct",
  pagePath: "/contact",
  pageCategory: "trust",
} as const;

describe("resolveContactLeadEvents", () => {
  it("emits contact_form_submit unchanged and generate_lead with contact params", () => {
    const events = resolveContactLeadEvents(acceptedInput);
    assert.ok(events, "accepted 2xx must produce lead events");
    assert.equal(events.contactFormSubmit.eventName, ANALYTICS_EVENTS.contactFormSubmit);
    assert.deepEqual(events.contactFormSubmit.properties, {
      form_name: CONTACT_FORM_NAME,
      lead_type: "contact_request",
      lead_source: CONTACT_FORM_NAME,
      lead_channel: "direct",
      page_path: "/contact",
      page_category: "trust",
    });
    assert.equal(events.generateLead.eventName, ANALYTICS_EVENTS.generateLead);
    assert.deepEqual(events.generateLead.properties, {
      form_name: CONTACT_GENERATE_LEAD_FORM_NAME,
      lead_source: CONTACT_FORM_NAME,
    });
    assert.equal(events.generateLead.properties.form_name, "contact");
    assert.equal(events.generateLead.properties.lead_source, "contact_form");
  });

  it("does not emit on a rejected backend or a validation miss", () => {
    assert.equal(
      resolveContactLeadEvents({ ...acceptedInput, accepted: false }),
      null,
    );
  });
});
