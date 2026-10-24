import assert from "node:assert/strict";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  legacyScheduleRequestSchema,
  preferredDayOptions,
  scheduleRequestV2Schema,
} from "../shared/scheduleRequest";
import {
  insertContactMessageSchema,
  insertNewsletterSubscriptionSchema,
} from "../shared/schema";

import { NextRequest } from "next/server";
import { POST as postScheduleRequest } from "../app/api/schedule-request/route";
import {
  resetScheduleRequestRateLimitForTests,
  SCHEDULE_REQUEST_RATE_LIMIT,
} from "../server/scheduleRateLimit";
import {
  startCapturingVercelServerEventsForTests,
  takeVercelServerEventsForTests,
} from "../server/vercelAnalytics";
import { ANALYTICS_EVENTS } from "../shared/analytics";
import { HONEYPOT_FIELD } from "../shared/formspree";

type RecordedCall = {
  url: string;
  method: string;
  body: Record<string, unknown>;
};

const requestWithBody = (
  payload: unknown,
  ip = "203.0.113.10",
): NextRequest =>
  new NextRequest("https://www.chriswongdds.com/api/schedule-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-real-ip": ip,
    },
    body: JSON.stringify(payload),
  });

const validV2Payload = {
  isEmergency: false,
  appointmentType: "New Patient Exam & Cleaning",
  schedulingMode: "first_available",
  firstName: "Synthetic",
  lastName: "Patient",
  phone: "6505550000",
  email: "synthetic.patient@example.com",
  contactPreference: "email",
  source: "schedule_page_form_v2",
  sourceUrl: "https://www.chriswongdds.com/schedule",
} as const;

const withMockedFetch = async (
  callback: (calls: RecordedCall[]) => Promise<void>,
): Promise<void> => {
  const originalFetch = globalThis.fetch;
  const calls: RecordedCall[] = [];

  resetScheduleRequestRateLimitForTests();
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
        preferredTime: "Afternoon (2pm-close)",
        firstName: "V2",
        lastName: "User",
        phone: "+1 (650) 555-1111",
        email: "v2@example.com",
        contactPreference: "email",
        insuranceProvider: "Delta Dental",
        message: "Need urgent support",
        source: "schedule_page_form_v2",
        sourceUrl: "https://www.chriswongdds.com/schedule?utm_source=v2",
        attribution: {
          channel: "google_business_profile",
          landingPath: "/",
          referrerHost: "www.google.com",
        },
      }),
    );

    assert.equal(response.status, 201);
    const formspree = assertFormspreeCall(calls);
    assert.equal(formspree.body.lead_channel, "google_business_profile");
    assert.equal(formspree.body.landing_page, "/");
    assert.equal(formspree.body.referrer_host, "www.google.com");
    assert.match(
      String(formspree.body.message),
      /Lead channel: Google Business Profile · landed on \/ · via www\.google\.com/,
    );
    assert.equal(formspree.body.phone, "6505551111");
    assert.equal(formspree.body.scheduling_mode, "choose_preferences");
    assert.equal(formspree.body.contact_preference, "email");
    assert.equal(formspree.body.insurance_status, "Delta Dental");
    assert.equal(formspree.body.urgent, "Yes");
    assert.equal(formspree.body.preferred_time_of_day, "Afternoon (2pm-close)");
    assert.equal(
      Object.hasOwn(formspree.body, "source_host_kind"),
      false,
      "canonical production leads must not carry source_host_kind",
    );
    assert.equal(
      String(formspree.body.message ?? "").includes("Source host:"),
      false,
      "clinic email must stay untagged for chriswongdds.com leads",
    );
  });
}

async function testLegacyTextContactPreferenceFallback() {
  await withMockedFetch(async (calls) => {
    const response = await postScheduleRequest(
      requestWithBody({
        isEmergency: false,
        appointmentType: "New Patient Exam & Cleaning",
        schedulingMode: "first_available",
        firstName: "Cached",
        lastName: "Text",
        phone: "6505553434",
        email: "cached.text@example.com",
        contactPreference: "text",
      }),
    );

    assert.equal(response.status, 201);
    const formspree = assertFormspreeCall(calls);
    assert.equal(formspree.body.contact_preference, "phone");
  });
}

async function testLegacyAfternoonPreferenceCompatibility() {
  await withMockedFetch(async (calls) => {
    const response = await postScheduleRequest(
      requestWithBody({
        isEmergency: false,
        appointmentType: "Existing Patient Checkup",
        schedulingMode: "choose_preferences",
        preferredDays: ["Monday"],
        preferredTime: "Afternoon (2pm-5pm)",
        firstName: "Cached",
        lastName: "Browser",
        phone: "6505552424",
        email: "cached.browser@example.com",
        contactPreference: "phone",
      }),
    );

    assert.equal(response.status, 201);
    const formspree = assertFormspreeCall(calls);
    assert.equal(formspree.body.preferred_time_of_day, "Afternoon (2pm-close)");
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
        contactPreference: "phone",
      }),
    );

    assert.equal(response.status, 201);
    const formspree = assertFormspreeCall(calls);
    assert.equal(formspree.body.phone, "6505559898");
    assert.equal(formspree.body.email, "");
    assert.equal(formspree.body.preferred_days, "First available");
    assert.equal(formspree.body.preferred_time_of_day, "First available");
    assert.equal(formspree.body.scheduling_mode, "first_available");
    assert.equal("_replyto" in formspree.body, false);
  });
}

async function testEmailOnlyMode() {
  await withMockedFetch(async (calls) => {
    const response = await postScheduleRequest(
      requestWithBody({
        isEmergency: false,
        appointmentType: "Invisalign Consultation",
        schedulingMode: "choose_preferences",
        preferredDays: ["Tuesday"],
        preferredTime: "Midday (11am-2pm)",
        firstName: "Email",
        lastName: "Only",
        email: "email.only@example.com",
        contactPreference: "email",
      }),
    );

    assert.equal(response.status, 201);
    const formspree = assertFormspreeCall(calls);
    assert.equal(formspree.body.phone, "");
    assert.equal(formspree.body.email, "email.only@example.com");
    assert.equal(formspree.body.contact_preference, "email");
    assert.equal(formspree.body._replyto, "email.only@example.com");
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
    const missingEmail = await postScheduleRequest(
      requestWithBody({
        isEmergency: false,
        appointmentType: "New Patient Exam & Cleaning",
        schedulingMode: "first_available",
        firstName: "Missing",
        lastName: "Email",
        phone: "6505553333",
        contactPreference: "email",
      }),
    );

    assert.equal(missingEmail.status, 400);
    assert.equal(calls.length, 0, "should not call webhook when preferred contact is missing");
  });

  await withMockedFetch(async (calls) => {
    const missingPhone = await postScheduleRequest(
      requestWithBody({
        isEmergency: false,
        appointmentType: "New Patient Exam & Cleaning",
        schedulingMode: "first_available",
        firstName: "Missing",
        lastName: "Phone",
        email: "missing.phone@example.com",
        contactPreference: "phone",
      }),
    );

    assert.equal(missingPhone.status, 400);
    assert.equal(calls.length, 0, "should not call webhook when preferred contact is missing");
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

async function testHoneypotIsNotALead() {
  await withMockedFetch(async (calls) => {
    const response = await postScheduleRequest(
      requestWithBody({
        ...validV2Payload,
        [HONEYPOT_FIELD]: "Acme Bot Corp",
      }),
    );
    const body = (await response.json()) as {
      ok?: boolean;
      accepted?: boolean;
      success?: boolean;
    };

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.accepted, false);
    assert.notEqual(body.success, true);
    assert.equal(calls.length, 0, "honeypot must not reach the office inbox");
  });
}

async function testFormspreeNonJsonIsFailure() {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  resetScheduleRequestRateLimitForTests();
  process.env.SCHEDULE_FORM_ENDPOINT = "https://formspree.io/f/mock-endpoint";
  console.error = () => undefined;

  globalThis.fetch = async () =>
    new Response("<html><body>Thanks</body></html>", {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });

  try {
    const response = await postScheduleRequest(requestWithBody(validV2Payload));
    const body = (await response.json()) as { success?: boolean };
    assert.equal(response.status, 500);
    assert.notEqual(body.success, true);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  }
}

async function testFormspreeSuccessFalseIsFailure() {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  resetScheduleRequestRateLimitForTests();
  process.env.SCHEDULE_FORM_ENDPOINT = "https://formspree.io/f/mock-endpoint";
  console.error = () => undefined;

  globalThis.fetch = async () =>
    new Response(JSON.stringify({ success: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  try {
    const response = await postScheduleRequest(requestWithBody(validV2Payload));
    const body = (await response.json()) as { success?: boolean };
    assert.equal(response.status, 500);
    assert.notEqual(body.success, true);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  }
}

async function testSourceAllowlist() {
  await withMockedFetch(async (calls) => {
    const rejectedSource = await postScheduleRequest(
      requestWithBody({
        ...validV2Payload,
        source: "invisalign-ads",
      }),
    );
    assert.equal(rejectedSource.status, 400);
    assert.equal(calls.length, 0);
  });

  await withMockedFetch(async (calls) => {
    const rejectedUrl = await postScheduleRequest(
      requestWithBody({
        ...validV2Payload,
        sourceUrl: "https://evil.example/phish",
      }),
    );
    assert.equal(rejectedUrl.status, 400);
    assert.equal(calls.length, 0);
  });

  await withMockedFetch(async (calls) => {
    const accepted = await postScheduleRequest(
      requestWithBody({
        ...validV2Payload,
        source: "invisalign_consult",
        sourceUrl: "https://www.chriswongdds.com/invisalign-consult",
      }),
    );
    assert.equal(accepted.status, 201);
    assert.equal(calls.length, 1);
  });

  await withMockedFetch(async (calls) => {
    const liveVercel = await postScheduleRequest(
      requestWithBody({
        ...validV2Payload,
        sourceUrl: "https://chris-wong-dds.vercel.app/schedule",
      }),
    );
    assert.equal(liveVercel.status, 201);
    assert.equal(
      Object.hasOwn(calls[0]?.body ?? {}, "source_host_kind"),
      false,
      "real-site leads must not carry source_host_kind",
    );
    assert.equal(
      String(calls[0]?.body.message ?? "").includes("Source host:"),
      false,
      "clinic email must stay untagged for real-site leads",
    );
  });

  await withMockedFetch(async (calls) => {
    const preview = await postScheduleRequest(
      requestWithBody({
        ...validV2Payload,
        sourceUrl:
          "https://chris-wong-dds-git-demo-enzo-design-prisms-projects.vercel.app/invisalign-consult",
      }),
    );
    assert.equal(preview.status, 201);
    assert.equal(calls[0]?.body.source_host_kind, "preview");
    assert.match(String(calls[0]?.body.message ?? ""), /Source host: preview/);
    assert.equal(String(calls[0]?.body.message ?? "").includes("production"), false);
  });

  await withMockedFetch(async (calls) => {
    const otherVercel = await postScheduleRequest(
      requestWithBody({
        ...validV2Payload,
        sourceUrl: "https://unrelated-app.vercel.app/schedule",
      }),
    );
    assert.equal(otherVercel.status, 400);
    assert.equal(calls.length, 0);
  });
}

async function testProductionRejectsLocalhostAndUserinfo() {
  const previous = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = "production";
  try {
    await withMockedFetch(async (calls) => {
      const localhost = await postScheduleRequest(
        requestWithBody({
          ...validV2Payload,
          sourceUrl: "http://localhost:3210/schedule",
        }),
      );
      assert.equal(localhost.status, 400);
      assert.equal(calls.length, 0);
    });

    await withMockedFetch(async (calls) => {
      const userinfo = await postScheduleRequest(
        requestWithBody({
          ...validV2Payload,
          sourceUrl: "https://user:secret@www.chriswongdds.com/schedule",
        }),
      );
      assert.equal(userinfo.status, 400);
      assert.equal(calls.length, 0);
    });

    await withMockedFetch(async (calls) => {
      const missingSource = await postScheduleRequest(
        requestWithBody({
          ...validV2Payload,
          source: undefined,
        }),
      );
      assert.equal(missingSource.status, 400);
      assert.equal(calls.length, 0);
    });

    await withMockedFetch(async (calls) => {
      const missingSourceUrl = await postScheduleRequest(
        requestWithBody({
          ...validV2Payload,
          sourceUrl: undefined,
        }),
      );
      assert.equal(missingSourceUrl.status, 400);
      assert.equal(calls.length, 0);
    });
  } finally {
    if (previous === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous;
  }
}

async function testPerIpRateLimit() {
  await withMockedFetch(async (calls) => {
    const ip = "198.51.100.77";
    for (let i = 0; i < SCHEDULE_REQUEST_RATE_LIMIT.maxHits; i += 1) {
      const response = await postScheduleRequest(
        requestWithBody(validV2Payload, ip),
      );
      assert.equal(response.status, 201, `request ${i + 1} should be accepted`);
    }

    const blocked = await postScheduleRequest(
      requestWithBody(validV2Payload, ip),
    );
    assert.equal(blocked.status, 429);
    assert.equal(blocked.headers.get("Retry-After") !== null, true);
    const body = (await blocked.json()) as { message?: string };
    assert.match(String(body.message), /Too many requests/);
    assert.equal(calls.length, SCHEDULE_REQUEST_RATE_LIMIT.maxHits);
  });
}

async function testRateLimitIgnoresHoneypotInvalidAndSpoofedXff() {
  await withMockedFetch(async (calls) => {
    const ip = "198.51.100.88";
    for (let i = 0; i < SCHEDULE_REQUEST_RATE_LIMIT.maxHits; i += 1) {
      const honeypot = await postScheduleRequest(
        requestWithBody({ ...validV2Payload, company: "bot" }, ip),
      );
      assert.equal(honeypot.status, 200);
    }

    const invalid = await postScheduleRequest(
      requestWithBody({ ...validV2Payload, source: "not-allowed" }, ip),
    );
    assert.equal(invalid.status, 400);

    const accepted = await postScheduleRequest(requestWithBody(validV2Payload, ip));
    assert.equal(accepted.status, 201);
    assert.equal(calls.length, 1, "honeypot/invalid posts must not consume the slot");
  });

  await withMockedFetch(async (calls) => {
    const spoofed = "203.0.113.200";
    const trusted = "198.51.100.99";
    for (let i = 0; i < SCHEDULE_REQUEST_RATE_LIMIT.maxHits; i += 1) {
      const request = new NextRequest(
        "https://www.chriswongdds.com/api/schedule-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": spoofed,
            "x-real-ip": trusted,
          },
          body: JSON.stringify(validV2Payload),
        },
      );
      const response = await postScheduleRequest(request);
      assert.equal(response.status, 201);
    }

    const blockedTrusted = await postScheduleRequest(
      new NextRequest("https://www.chriswongdds.com/api/schedule-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": spoofed,
          "x-real-ip": trusted,
        },
        body: JSON.stringify(validV2Payload),
      }),
    );
    assert.equal(blockedTrusted.status, 429);

    const spoofOnly = await postScheduleRequest(
      new NextRequest("https://www.chriswongdds.com/api/schedule-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": spoofed,
        },
        body: JSON.stringify(validV2Payload),
      }),
    );
    assert.equal(
      spoofOnly.status,
      201,
      "first XFF hop must not be the rate-limit key",
    );
    assert.equal(calls.length, SCHEDULE_REQUEST_RATE_LIMIT.maxHits + 1);
  });
}

async function testDefaultFormspreeFallback() {
  const originalFetch = globalThis.fetch;
  const originalScheduleEndpoint = process.env.SCHEDULE_FORM_ENDPOINT;
  const originalPublicEndpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT;
  const calls: RecordedCall[] = [];
  resetScheduleRequestRateLimitForTests();

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
  resetScheduleRequestRateLimitForTests();

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

async function testProductionServerEventOmitsSourceHostKind() {
  startCapturingVercelServerEventsForTests();
  try {
    await withMockedFetch(async () => {
      const response = await postScheduleRequest(requestWithBody(validV2Payload));
      assert.equal(response.status, 201);
    });

    const events = takeVercelServerEventsForTests();
    const submitEvents = events.filter(
      (event) => event.name === ANALYTICS_EVENTS.appointmentRequestSubmit,
    );
    assert.equal(submitEvents.length, 1, "real-site submit must emit one server event");
    assert.equal(
      Object.hasOwn(submitEvents[0].properties, "source_host_kind"),
      false,
      "server event must stay untagged for real-site leads",
    );
  } finally {
    takeVercelServerEventsForTests();
  }
}

async function testOptionalForwardingFailureIsSanitized() {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const originalScheduleEndpoint = process.env.SCHEDULE_FORM_ENDPOINT;
  const originalCrmEndpoint = process.env.SCHEDULE_CRM_WEBHOOK_URL;
  const originalSlackEndpoint = process.env.SCHEDULE_SLACK_WEBHOOK_URL;
  const calls: RecordedCall[] = [];
  resetScheduleRequestRateLimitForTests();

  process.env.SCHEDULE_FORM_ENDPOINT = "https://formspree.io/f/mock-endpoint";
  process.env.SCHEDULE_CRM_WEBHOOK_URL = "https://crm.example.test/hook";
  process.env.SCHEDULE_SLACK_WEBHOOK_URL = "https://slack.example.test/hook";
  console.error = () => undefined;

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

    if (url === "https://formspree.io/f/mock-endpoint") {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("vendor-secret-response-body", { status: 502 });
  };

  try {
    const response = await postScheduleRequest(
      requestWithBody({
        isEmergency: false,
        appointmentType: "New Patient Exam & Cleaning",
        schedulingMode: "first_available",
        firstName: "Forwarding",
        lastName: "Failure",
        email: "forwarding.failure@example.com",
        contactPreference: "email",
      }),
    );
    const responseBody = (await response.json()) as {
      forwarding: Record<string, { enabled: boolean; sent: boolean }>;
    };

    assert.equal(response.status, 201);
    assert.equal(calls.length, 3, "expected primary inbox plus two optional forwards");
    assert.deepEqual(responseBody.forwarding, {
      crm: { enabled: true, sent: false },
      slack: { enabled: true, sent: false },
    });
    assert.equal(
      JSON.stringify(responseBody).includes("vendor-secret-response-body"),
      false,
      "public response must not expose an optional vendor response body",
    );
    assert.equal(
      JSON.stringify(responseBody).includes("error"),
      false,
      "public forwarding status must expose booleans only",
    );
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;

    const restoreEnvironment = (name: string, value: string | undefined) => {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    };

    restoreEnvironment("SCHEDULE_FORM_ENDPOINT", originalScheduleEndpoint);
    restoreEnvironment("SCHEDULE_CRM_WEBHOOK_URL", originalCrmEndpoint);
    restoreEnvironment("SCHEDULE_SLACK_WEBHOOK_URL", originalSlackEndpoint);
  }
}

async function testRejectedInboxNeverLogsPatientDetails() {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const originalEndpoint = process.env.SCHEDULE_FORM_ENDPOINT;
  const sensitiveDetails = "Synthetic Patient synthetic.patient@example.com 6505550000 private-note";
  const logged: string[] = [];
  process.env.SCHEDULE_FORM_ENDPOINT = "https://formspree.io/f/mock-endpoint";
  console.error = (...args: unknown[]) => {
    logged.push(args.map((arg) => arg instanceof Error
      ? `${arg.name}: ${arg.message} ${arg.stack}`
      : JSON.stringify(arg)).join(" "));
  };

  try {
    for (const failure of ["body", "exception"] as const) {
      globalThis.fetch = async () => {
        if (failure === "exception") throw new Error(sensitiveDetails);
        return new Response(JSON.stringify({ message: sensitiveDetails }), { status: 422 });
      };
      const response = await postScheduleRequest(requestWithBody(validV2Payload));
      assert.equal(response.status, 500);
      const publicBody = await response.text();
      for (const patientDetail of sensitiveDetails.split(" ")) {
        assert.equal(publicBody.includes(patientDetail), false);
        assert.equal(logged.join(" ").includes(patientDetail), false,
          "vendor error bodies and exception messages must not enter logs");
      }
    }
    assert.match(logged[0], /office_inbox_delivery_failed/);
    assert.match(logged[0], /422/);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
    if (originalEndpoint === undefined) delete process.env.SCHEDULE_FORM_ENDPOINT;
    else process.env.SCHEDULE_FORM_ENDPOINT = originalEndpoint;
  }
}

async function testHungOptionalServicesKeepInboxAcceptance() {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const envKeys = ["SCHEDULE_FORM_ENDPOINT", "SCHEDULE_CRM_WEBHOOK_URL",
    "SCHEDULE_SLACK_WEBHOOK_URL", "VERCEL_URL", "VERCEL_ENV"] as const;
  const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  process.env.SCHEDULE_FORM_ENDPOINT = "https://formspree.io/f/mock-endpoint";
  process.env.SCHEDULE_CRM_WEBHOOK_URL = "https://crm.example.test/hook";
  process.env.SCHEDULE_SLACK_WEBHOOK_URL = "https://slack.example.test/hook";
  process.env.VERCEL_URL = "analytics.example.test";
  process.env.VERCEL_ENV = "production";
  console.error = () => undefined;

  try {
    for (const crmAcknowledges of [false, true]) {
          const optionalCalls: string[] = [];
      const webhookSignals: AbortSignal[] = [];
      globalThis.fetch = async (input: URL | RequestInfo, init?: RequestInit) => {
        const url = typeof input === "string" ? input
          : input instanceof URL ? input.href : input.url;
        if (url === process.env.SCHEDULE_FORM_ENDPOINT) {
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
        optionalCalls.push(url);
        if (url === process.env.SCHEDULE_CRM_WEBHOOK_URL && crmAcknowledges) {
          return new Response("acknowledged", { status: 200 });
        }
        if (url.includes("/_vercel/insights/event")) {
          // The analytics SDK has no AbortSignal option. Even a transport
          // which never settles must not hold the primary inbox result open.
          return new Promise<Response>(() => undefined);
        }
        assert.ok(init?.signal, "optional webhooks need an abortable deadline");
        const signal = init.signal;
        webhookSignals.push(signal);
        return new Promise<Response>((_, reject) => {
          signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")),
            { once: true });
        });
      };
      const started = performance.now();
      const response = await postScheduleRequest(requestWithBody(validV2Payload));
      const elapsed = performance.now() - started;
      assert.equal(response.status, 201, "accepted inbox delivery stays successful");
      const body = await response.json();
      assert.equal(body.success, true);
      assert.deepEqual(body.forwarding, {
        crm: { enabled: true, sent: crmAcknowledges },
        slack: { enabled: true, sent: false },
      });
      assert.equal(optionalCalls.length, 3, "analytics and both webhooks must start together");
      assert.ok(optionalCalls.some((url) => url.includes("/_vercel/insights/event")));
      assert.ok(webhookSignals.every((signal) => signal.aborted));
      assert.ok(elapsed < 3_000,
        `hung optional services exceeded the 2s response budget plus scheduling tolerance: ${elapsed}ms`);
    }
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
    for (const key of envKeys) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  }
}

async function testPatchedCollectionLimitsAndLegacyCompatibility() {
  const oversizedDays = Array.from({ length: 10_000 }, () => "invalid-day");
  const legacyPayload = {
    emergency: false,
    appointmentType: "Existing Patient Checkup",
    preferredDays: [...preferredDayOptions],
    preferredTimeOfDay: "Morning (8am-11am)",
    firstName: "Synthetic",
    lastName: "Patient",
    phone: "6505550000",
    email: "synthetic.patient@example.com",
    utmParams: { utm_source: "google", utm_medium: "cpc", utm_campaign: "test",
      utm_term: "dentist", utm_content: "text" },
  };

  // These must be real patched v4 schemas, including schemas generated by
  // drizzle-zod. Importing zod/v3 from a new package version is insufficient.
  for (const schema of [scheduleRequestV2Schema, legacyScheduleRequestSchema,
    insertContactMessageSchema, insertNewsletterSubscriptionSchema]) {
    assert.ok("_zod" in schema, "request schemas must use the v4 implementation");
  }
  for (const [schema, payload] of [
    [scheduleRequestV2Schema, { ...validV2Payload, preferredDays: oversizedDays }],
    [legacyScheduleRequestSchema, { ...legacyPayload, preferredDays: oversizedDays }],
  ] as const) {
    const result = schema.safeParse(payload);
    assert.equal(result.success, false);
    if (result.success) throw new Error("oversized collection unexpectedly accepted");
    assert.deepEqual(result.error.issues.map(({ code, path }) => ({ code, path })),
      [{ code: "too_big", path: ["preferredDays"] }],
      "size bounds must reject before producing one error per invalid element");
  }

  const parsedLegacy = legacyScheduleRequestSchema.parse(legacyPayload);
  assert.deepEqual(parsedLegacy.preferredDays, [...preferredDayOptions]);
  assert.deepEqual(parsedLegacy.utmParams, legacyPayload.utmParams);
  await withMockedFetch(async (calls) => {
    const accepted = await postScheduleRequest(requestWithBody(legacyPayload));
    assert.equal(accepted.status, 201, "all five existing legacy weekdays stay supported");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].body.preferred_days, "Monday, Tuesday, Wednesday");
  });
  await withMockedFetch(async (calls) => {
    const rejected = await postScheduleRequest(requestWithBody({
      ...validV2Payload, preferredDays: oversizedDays,
    }));
    assert.equal(rejected.status, 400);
    assert.ok((await rejected.text()).length < 2_000,
      "collection rejection must not amplify the response with element errors");
    assert.equal(calls.length, 0, "oversized collections must not reach any service");
  });
}

async function testV4FormResolverCompatibility() {
  const resolver = zodResolver(insertNewsletterSubscriptionSchema);
  const options = { criteriaMode: "firstError" as const, fields: {},
    shouldUseNativeValidation: false };
  const normalized = await resolver({ email: "  SYNTHETIC@EXAMPLE.COM  " }, undefined, options);
  assert.deepEqual(normalized.errors, {});
  assert.deepEqual(normalized.values, { email: "synthetic@example.com" });
  const rejected = await resolver({ email: "invalid" }, undefined, options);
  assert.deepEqual(rejected.values, {});
  assert.equal(rejected.errors.email?.message, "Enter a valid email address.");
}

(async function run() {
  await testPatchedCollectionLimitsAndLegacyCompatibility();
  await testV4FormResolverCompatibility();
  await testLegacyPayloadCompatibility();
  await testV2PayloadCompatibility();
  await testLegacyTextContactPreferenceFallback();
  await testLegacyAfternoonPreferenceCompatibility();
  await testFirstAvailableMode();
  await testEmailOnlyMode();
  await testValidationFailures();
  await testHoneypotIsNotALead();
  await testFormspreeNonJsonIsFailure();
  await testFormspreeSuccessFalseIsFailure();
  await testSourceAllowlist();
  await testProductionServerEventOmitsSourceHostKind();
  await testProductionRejectsLocalhostAndUserinfo();
  await testPerIpRateLimit();
  await testRateLimitIgnoresHoneypotInvalidAndSpoofedXff();
  await testDefaultFormspreeFallback();
  await testBlankEnvironmentFallsBackToDefaultFormspreeEndpoint();
  await testOptionalForwardingFailureIsSanitized();
  await testRejectedInboxNeverLogsPatientDetails();
  await testHungOptionalServicesKeepInboxAcceptance();

  console.log("Schedule request contract checks passed.");
})().catch((error: unknown) => {
  console.error("Schedule request contract check failed:", error);
  process.exit(1);
});
