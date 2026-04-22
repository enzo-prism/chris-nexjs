import assert from "node:assert/strict";

import { NextRequest } from "next/server";
import { POST as postScheduleRequest } from "../app/api/schedule-request/route";

type RecordedCall = {
  url: string;
  method: string;
  body: Record<string, unknown>;
};

const requestWithBody = (payload: unknown): NextRequest =>
  new NextRequest("https://www.chriswongdds.com/api/schedule-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

const withMockedFetch = async (
  callback: (calls: RecordedCall[]) => Promise<void>,
): Promise<void> => {
  const originalFetch = globalThis.fetch;
  const calls: RecordedCall[] = [];

  process.env.SCHEDULE_FORM_ENDPOINT = "https://formspree.io/f/mock-endpoint";
  delete process.env.NEXT_PUBLIC_FORM_ENDPOINT;
  delete process.env.SCHEDULE_CRM_WEBHOOK_URL;
  delete process.env.SCHEDULE_SLACK_WEBHOOK_URL;

  globalThis.fetch = async (input: URL | RequestInfo, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const method = init?.method ?? "GET";
    const body =
      typeof init?.body === "string" && init.body.length > 0
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : {};

    calls.push({ url, method, body });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    await callback(calls);
  } finally {
    globalThis.fetch = originalFetch;
  }
};

const assertFormspreeCall = (calls: RecordedCall[]): RecordedCall => {
  assert.equal(calls.length, 1, "expected exactly one webhook call");
  assert.equal(calls[0].url, "https://formspree.io/f/mock-endpoint");
  assert.equal(calls[0].method, "POST");
  return calls[0];
};

async function testLegacyPayloadCompatibility() {
  await withMockedFetch(async (calls) => {
    const response = await postScheduleRequest(
      requestWithBody({
        emergency: false,
        appointmentType: "Existing Patient Checkup",
        preferredDays: ["Monday", "Wednesday"],
        preferredTimeOfDay: "Morning (8am-11am)",
        firstName: "Legacy",
        lastName: "User",
        phone: "(650) 555-1212",
        email: "legacy@example.com",
        insuranceStatus: "Yes",
        additionalNotes: "Legacy payload still works",
        sourceUrl: "https://www.chriswongdds.com/schedule?utm_source=legacy",
      }),
    );

    assert.equal(response.status, 201);
    const formspree = assertFormspreeCall(calls);
    assert.equal(formspree.body.scheduling_mode, "choose_preferences");
    assert.equal(formspree.body.contact_preference, "phone");
    assert.equal(formspree.body.urgent, "No");
    assert.equal(formspree.body.preferred_days, "Monday, Wednesday");
  });
}

async function testV2PayloadCompatibility() {
  await withMockedFetch(async (calls) => {
    const response = await postScheduleRequest(
      requestWithBody({
        isEmergency: true,
        appointmentType: "Emergency Visit",
        schedulingMode: "choose_preferences",
        preferredDays: ["Tuesday", "Thursday"],
        preferredTime: "Afternoon (2pm-5pm)",
        firstName: "V2",
        lastName: "User",
        phone: "+1 (650) 555-1111",
        email: "v2@example.com",
        contactPreference: "text",
        insuranceProvider: "Delta Dental",
        message: "Need urgent support",
        source: "schedule_page_form_v2",
        sourceUrl: "https://www.chriswongdds.com/schedule?utm_source=v2",
      }),
    );

    assert.equal(response.status, 201);
    const formspree = assertFormspreeCall(calls);
    assert.equal(formspree.body.phone, "6505551111");
    assert.equal(formspree.body.scheduling_mode, "choose_preferences");
    assert.equal(formspree.body.contact_preference, "text");
    assert.equal(formspree.body.insurance_status, "Delta Dental");
    assert.equal(formspree.body.urgent, "Yes");
  });
}

async function testFirstAvailableMode() {
  await withMockedFetch(async (calls) => {
    const response = await postScheduleRequest(
      requestWithBody({
        isEmergency: false,
        appointmentType: "Cosmetic Consultation",
        schedulingMode: "first_available",
        firstName: "First",
        lastName: "Available",
        phone: "650-555-9898",
        email: "first.available@example.com",
        contactPreference: "email",
      }),
    );

    assert.equal(response.status, 201);
    const formspree = assertFormspreeCall(calls);
    assert.equal(formspree.body.preferred_days, "First available");
    assert.equal(formspree.body.preferred_time_of_day, "First available");
    assert.equal(formspree.body.scheduling_mode, "first_available");
  });
}

async function testValidationFailures() {
  await withMockedFetch(async (calls) => {
    const missingPreferences = await postScheduleRequest(
      requestWithBody({
        isEmergency: false,
        appointmentType: "New Patient Exam & Cleaning",
        schedulingMode: "choose_preferences",
        firstName: "Missing",
        lastName: "Preferences",
        phone: "6505557777",
        email: "missing.preferences@example.com",
        contactPreference: "phone",
      }),
    );

    assert.equal(missingPreferences.status, 400);
    assert.equal(calls.length, 0, "should not call webhook when validation fails");
  });

  await withMockedFetch(async (calls) => {
    const invalidPhone = await postScheduleRequest(
      requestWithBody({
        isEmergency: false,
        appointmentType: "New Patient Exam & Cleaning",
        schedulingMode: "first_available",
        firstName: "Invalid",
        lastName: "Phone",
        phone: "12345",
        email: "invalid.phone@example.com",
        contactPreference: "phone",
      }),
    );

    assert.equal(invalidPhone.status, 400);
    assert.equal(calls.length, 0, "should not call webhook when phone is invalid");
  });
}

async function testDefaultFormspreeFallback() {
  const originalFetch = globalThis.fetch;
  const originalScheduleEndpoint = process.env.SCHEDULE_FORM_ENDPOINT;
  const originalPublicEndpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT;
  const calls: RecordedCall[] = [];

  delete process.env.SCHEDULE_FORM_ENDPOINT;
  delete process.env.NEXT_PUBLIC_FORM_ENDPOINT;

  globalThis.fetch = async (input: URL | RequestInfo, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const method = init?.method ?? "GET";
    const body =
      typeof init?.body === "string" && init.body.length > 0
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : {};

    calls.push({ url, method, body });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const response = await postScheduleRequest(
      requestWithBody({
        isEmergency: false,
        appointmentType: "New Patient Exam & Cleaning",
        schedulingMode: "first_available",
        firstName: "Fallback",
        lastName: "Check",
        phone: "6505550000",
        email: "fallback.check@example.com",
        contactPreference: "email",
      }),
    );

    assert.equal(response.status, 201);
    assert.equal(calls.length, 1, "expected exactly one webhook call");
    assert.equal(calls[0].url, "https://formspree.io/f/xojnrjna");
  } finally {
    globalThis.fetch = originalFetch;

    if (originalScheduleEndpoint === undefined) {
      delete process.env.SCHEDULE_FORM_ENDPOINT;
    } else {
      process.env.SCHEDULE_FORM_ENDPOINT = originalScheduleEndpoint;
    }

    if (originalPublicEndpoint === undefined) {
      delete process.env.NEXT_PUBLIC_FORM_ENDPOINT;
    } else {
      process.env.NEXT_PUBLIC_FORM_ENDPOINT = originalPublicEndpoint;
    }
  }
}

async function testBlankEnvironmentFallsBackToDefaultFormspreeEndpoint() {
  const originalFetch = globalThis.fetch;
  const originalScheduleEndpoint = process.env.SCHEDULE_FORM_ENDPOINT;
  const originalPublicEndpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT;
  const calls: RecordedCall[] = [];

  process.env.SCHEDULE_FORM_ENDPOINT = "   ";
  process.env.NEXT_PUBLIC_FORM_ENDPOINT = "";

  globalThis.fetch = async (input: URL | RequestInfo, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const method = init?.method ?? "GET";
    const body =
      typeof init?.body === "string" && init.body.length > 0
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : {};

    calls.push({ url, method, body });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const response = await postScheduleRequest(
      requestWithBody({
        isEmergency: false,
        appointmentType: "New Patient Exam & Cleaning",
        schedulingMode: "first_available",
        firstName: "Blank",
        lastName: "Environment",
        phone: "6505551212",
        email: "blank.environment@example.com",
        contactPreference: "phone",
      }),
    );

    assert.equal(response.status, 201);
    assert.equal(calls.length, 1, "expected exactly one webhook call");
    assert.equal(calls[0].url, "https://formspree.io/f/xojnrjna");
  } finally {
    globalThis.fetch = originalFetch;

    if (originalScheduleEndpoint === undefined) {
      delete process.env.SCHEDULE_FORM_ENDPOINT;
    } else {
      process.env.SCHEDULE_FORM_ENDPOINT = originalScheduleEndpoint;
    }

    if (originalPublicEndpoint === undefined) {
      delete process.env.NEXT_PUBLIC_FORM_ENDPOINT;
    } else {
      process.env.NEXT_PUBLIC_FORM_ENDPOINT = originalPublicEndpoint;
    }
  }
}

(async function run() {
  await testLegacyPayloadCompatibility();
  await testV2PayloadCompatibility();
  await testFirstAvailableMode();
  await testValidationFailures();
  await testDefaultFormspreeFallback();
  await testBlankEnvironmentFallsBackToDefaultFormspreeEndpoint();

  console.log("Schedule request contract checks passed.");
})().catch((error: unknown) => {
  console.error("Schedule request contract check failed:", error);
  process.exit(1);
});
