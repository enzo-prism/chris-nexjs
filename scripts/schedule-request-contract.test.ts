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

async function testOptionalForwardingFailureIsSanitized() {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const originalScheduleEndpoint = process.env.SCHEDULE_FORM_ENDPOINT;
  const originalCrmEndpoint = process.env.SCHEDULE_CRM_WEBHOOK_URL;
  const originalSlackEndpoint = process.env.SCHEDULE_SLACK_WEBHOOK_URL;
  const calls: RecordedCall[] = [];

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

(async function run() {
  await testLegacyPayloadCompatibility();
  await testV2PayloadCompatibility();
  await testLegacyTextContactPreferenceFallback();
  await testLegacyAfternoonPreferenceCompatibility();
  await testFirstAvailableMode();
  await testEmailOnlyMode();
  await testValidationFailures();
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
