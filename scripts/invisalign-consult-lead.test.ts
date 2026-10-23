import assert from "node:assert/strict";

import { ANALYTICS_EVENTS } from "../shared/analytics";
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
  pagePath: "/invisalign",
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
  assert.equal(success.properties.page_path, "/invisalign");
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

testLeadFiresOnlyOnSuccess();
testLeadDoesNotFireOnFailure();
testScheduleFormNameUnchanged();

console.log("invisalign consult lead tests passed");
