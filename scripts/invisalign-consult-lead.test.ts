import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { ANALYTICS_EVENTS } from "../shared/analytics";
import { getAppointmentTypeForIntent } from "../shared/scheduleRequest";
import {
  INVISALIGN_CONSULT_FORM_NAME,
  resolveAppointmentLeadEvent,
} from "../client/src/lib/appointmentLead";

const baseInput = {
  formName: INVISALIGN_CONSULT_FORM_NAME,
  appointmentType: "Invisalign Consultation",
  schedulingMode: "first_available",
  urgentFlag: false,
  contactPreference: "phone",
  leadChannel: "paid_search",
  pagePath: "/invisalign-consult",
  pageCategory: "service",
} as const;

function testLeadFiresOnlyOnSuccess() {
  const success = resolveAppointmentLeadEvent({
    ...baseInput,
    submitted: true,
    success: true,
  });

  assert.ok(success, "successful Invisalign consult submit must produce a lead event");
  assert.equal(success.generateLead, ANALYTICS_EVENTS.generateLead);
  assert.equal(success.eventName, ANALYTICS_EVENTS.appointmentRequestSubmit);
  assert.equal(success.properties.form_name, "invisalign_consult");
  assert.equal(success.properties.lead_source, "invisalign_consult");
  assert.equal(success.properties.appointment_type, "Invisalign Consultation");
  assert.equal(success.properties.page_path, "/invisalign-consult");
}

function testLeadDoesNotFireOnFailure() {
  const validationMiss = resolveAppointmentLeadEvent({
    ...baseInput,
    submitted: false,
    success: false,
  });
  assert.equal(validationMiss, null, "validation failure must not fire generate_lead");

  const serverMiss = resolveAppointmentLeadEvent({
    ...baseInput,
    submitted: true,
    success: false,
  });
  assert.equal(serverMiss, null, "server/network failure must not fire generate_lead");
}

function testScheduleFormNameUnchanged() {
  const scheduleLead = resolveAppointmentLeadEvent({
    ...baseInput,
    formName: "schedule_request_form",
    submitted: true,
    success: true,
  });

  assert.ok(scheduleLead);
  assert.equal(scheduleLead.properties.form_name, "schedule_request_form");
  assert.notEqual(scheduleLead.properties.form_name, "invisalign_consult");
}

function testIntentPrefillsInvisalignConsultation() {
  assert.equal(getAppointmentTypeForIntent("invisalign"), "Invisalign Consultation");
}

function testVisitTypeToggleHasDisclosureSemantics() {
  const form = readFileSync("client/src/components/forms/AppointmentForm.tsx", "utf8");
  assert.match(
    form,
    /export const APPOINTMENT_TYPE_OPTIONS_ID = "appointment-type-options"/,
  );
  assert.match(form, /id=\{APPOINTMENT_TYPE_OPTIONS_ID\}/);
  assert.match(form, /aria-controls=\{APPOINTMENT_TYPE_OPTIONS_ID\}/);
  assert.match(form, /aria-expanded=\{showAllTypes\}/);
}

function testHeroReviewChipStaysFourteenPxOnNarrowViewports() {
  const page = readFileSync("client/src/pages/InvisalignConsult.tsx", "utf8");
  assert.match(page, /reviewLinkClassName="[^"]*text-sm/);
  assert.match(page, /reviewLinkClassName="[^"]*min-h-11/);
  assert.match(page, /reviewLinkClassName="[^"]*whitespace-nowrap/);
  assert.doesNotMatch(page, /reviewLinkClassName="[^"]*text-xs/);
}

function testAdsPageKeepsHeldOutCopyOut() {
  const page = readFileSync("client/src/pages/InvisalignConsult.tsx", "utf8");
  const costPanel = readFileSync("client/src/components/services/CostPanel.tsx", "utf8");
  const form = readFileSync("client/src/components/forms/AppointmentForm.tsx", "utf8");

  assert.match(page, /Request an Invisalign consult/);
  assert.match(page, /requestSource="invisalign-ads"/);
  assert.match(page, /getAppointmentTypeForIntent\("invisalign"\)/);
  assert.match(page, /collapseAppointmentTypes/);
  assert.match(page, /className="bg-white"/);
  assert.match(page, /aspect-\[4\/3\]/);
  assert.match(page, /Change visit type|collapseAppointmentTypes/);
  assert.match(costPanel, /whitespace-normal/);
  assert.match(form, /Change visit type/);
  assert.doesNotMatch(page, /\bfree\b/i, "ads page must not claim a free consult until confirmed");
  assert.doesNotMatch(page, /ServiceReviews|ReviewCard/, "review cards stay out until verbatim Invisalign quotes exist");
  assert.doesNotMatch(
    page,
    /PLACEHOLDER|official Invisalign video|financing/i,
    "price, financing, and official-asset slots stay out",
  );
  assert.match(costPanel, /buttonLabel = "Request a visit"/);
  assert.match(form, /shadow-soft/);
  assert.doesNotMatch(form, /rgba\(37,\s*99,\s*235/);
}

testLeadFiresOnlyOnSuccess();
testLeadDoesNotFireOnFailure();
testScheduleFormNameUnchanged();
testIntentPrefillsInvisalignConsultation();
testVisitTypeToggleHasDisclosureSemantics();
testHeroReviewChipStaysFourteenPxOnNarrowViewports();
testAdsPageKeepsHeldOutCopyOut();

console.log("invisalign consult lead tests passed");
