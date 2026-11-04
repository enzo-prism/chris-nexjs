import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/contact/route";
import {
  CONTACT_DB_ABANDON_MS,
  CONTACT_DB_TIMEOUT_MS,
  flushContactAfterTasksForTests,
} from "../server/contactFollowUp";
import { FORMSPREE_OPS_QA_FIELD } from "../shared/formspree";
import { getStorage } from "../server/storage/repository";
import {
  mockTrackVercelServerEventForTests,
  startCapturingVercelServerEventsForTests,
  takeVercelServerEventsForTests,
  trackVercelServerEvent,
} from "../server/vercelAnalytics";
import { hasStillPending, installFakeTimers, yieldMicrotasks } from "./contact-fake-timers";

const payload = {
  fullName: "Contact Example",
  email: "contact.example@example.com",
  phone: "6505550100",
  subject: "services",
  message: "Synthetic local contract check.",
};

function captureContactLogs(): {
  readonly lines: string[];
  stillPendingAt: number;
  restore(): void;
} {
  const lines: string[] = [];
  const originalError = console.error;
  const originalWarn = console.warn;
  const captured = {
    lines,
    stillPendingAt: 0,
    restore(): void {
      console.error = originalError;
      console.warn = originalWarn;
    },
  };
  const record =
    (original: typeof console.error) =>
    (...args: unknown[]): void => {
      const line = args.map(String).join(" ");
      lines.push(line);
      if (
        captured.stillPendingAt === 0 &&
        line.includes("[contact] persist timed out, still pending")
      ) {
        captured.stillPendingAt = Date.now();
      }
      original.apply(console, args);
    };
  console.error = record(originalError);
  console.warn = record(originalWarn);
  return captured;
}

function request(body: unknown): NextRequest {
  return new NextRequest("https://www.chriswongdds.com/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function run(): Promise<void> {
  const originalFetch = globalThis.fetch;
  const savedEnv = { ...process.env };
  const deliveries: unknown[] = [];
  let inboxBody: unknown = { ok: true };
  let inboxStatus = 200;
  delete process.env.DATABASE_URL;
  delete process.env.VERCEL_URL;
  delete process.env.VERCEL_WEB_ANALYTICS_ENDPOINT;
  process.env.VERCEL_ENV = "production";
  const storage = await getStorage();
  const originalCreate = storage.createContactMessage;
  let stored = 0;
  storage.createContactMessage = async (data) => {
    stored += 1;
    return originalCreate.call(storage, data);
  };
  globalThis.fetch = async (input, init) => {
    assert.match(String(input), /^https:\/\/formspree\.io\/f\//);
    deliveries.push(JSON.parse(String(init?.body)));
    return new Response(typeof inboxBody === "string" ? inboxBody : JSON.stringify(inboxBody), {
      status: inboxStatus,
      headers: { "Content-Type": typeof inboxBody === "string" ? "text/html" : "application/json" },
    });
  };

  try {
    assert.equal(CONTACT_DB_TIMEOUT_MS, 2_000);
    assert.equal(CONTACT_DB_ABANDON_MS, 25_000);
    startCapturingVercelServerEventsForTests();
    const bot = await POST(request({ company: "spam" }));
    assert.equal(bot.status, 201);
    assert.deepEqual(await bot.json(), { ok: true, accepted: false });
    assert.equal(deliveries.length, 0, "honeypot must not reach the inbox");
    await flushContactAfterTasksForTests();
    assert.deepEqual(takeVercelServerEventsForTests(), []);
    assert.equal(stored, 0);

    for (const marker of [true, "true"]) {
      startCapturingVercelServerEventsForTests();
      const test = await POST(request({ ...payload, [FORMSPREE_OPS_QA_FIELD]: marker }));
      assert.deepEqual(await test.json(), { ok: true, accepted: false, test: true });
      assert.equal(deliveries.length, 0, "QA submission must not reach the inbox");
      await flushContactAfterTasksForTests();
      assert.deepEqual(takeVercelServerEventsForTests(), []);
    }

    process.env.VERCEL_ENV = "preview";
    startCapturingVercelServerEventsForTests();
    const preview = await POST(request(payload));
    assert.deepEqual(await preview.json(), { ok: true, accepted: false, preview: true });
    assert.equal(deliveries.length, 0, "preview must not reach the inbox");
    await flushContactAfterTasksForTests();
    assert.deepEqual(takeVercelServerEventsForTests(), []);
    const invalidPreview = await POST(request({ ...payload, email: "invalid" }));
    assert.equal(invalidPreview.status, 400, "preview still validates real fields");
    process.env.VERCEL_ENV = "production";
    assert.equal(stored, 0, "QA/preview must not be persisted");

    for (const [status, body] of [
      [500, { ok: true }],
      [200, { ok: false }],
      [200, { ok: false, success: true }],
      [200, { ok: true, success: false }],
      [200, { ok: true, accepted: false }],
      [200, { ok: true, test: true }],
      [200, { ok: true, preview: true }],
      [200, { next: "test-redirect-url", ok: false }],
      [200, { next: "test-redirect-url", success: false }],
      [200, { next: "test-redirect-url", accepted: false }],
      [200, { next: "test-redirect-url", test: true }],
      [200, { next: "test-redirect-url", preview: true }],
      [200, { next: "test-redirect-url", errors: [{ message: "Rejected" }] }],
      [200, { ok: true, errors: [{ message: "Rejected" }] }],
      [200, { next: "" }],
      [200, { next: 42 }],
      [200, "<html>Not an accepted inquiry</html>"],
    ] as const) {
      inboxStatus = status;
      inboxBody = body;
      startCapturingVercelServerEventsForTests();
      const rejected = await POST(request(payload));
      assert.equal(rejected.status, 500, JSON.stringify({ status, body }));
      assert.notEqual((await rejected.json()).accepted, true);
      await flushContactAfterTasksForTests();
      assert.deepEqual(takeVercelServerEventsForTests(), []);
      assert.equal(stored, 0, "rejected inbox responses must not be persisted");
    }

    inboxStatus = 200;
    let acceptedCount = 0;
    for (const body of [
      { ok: true },
      { success: true },
      // Formspree's official SDK success fixture has only `next`.
      { next: "test-redirect-url" },
      { ok: true, next: "test-redirect-url" },
      { next: "test-redirect-url", errors: [] },
    ]) {
      inboxBody = body;
      startCapturingVercelServerEventsForTests();
      const accepted = await POST(request(payload));
      assert.equal(accepted.status, 201, JSON.stringify(body));
      assert.deepEqual(await accepted.json(), { ok: true, accepted: true });
      await flushContactAfterTasksForTests();
      acceptedCount += 1;
      assert.equal(stored, acceptedCount, "only accepted inquiries are persisted");
      const events = takeVercelServerEventsForTests();
      assert.equal(events.length, 1);
      assert.equal(events[0].name, "contact_form_submit");
      assert.equal(events[0].properties.page_path, "/contact");
      assert.equal(JSON.stringify(events).includes(payload.email), false);
    }

    let hangTimer: ReturnType<typeof setTimeout> | undefined;
    let persistStartedAt = 0;
    storage.createContactMessage = async () => {
      persistStartedAt = Date.now();
      await new Promise<void>((resolve) => {
        hangTimer = setTimeout(resolve, 2_200);
      });
      throw new Error("slow DB must be bounded, not awaited to completion");
    };
    startCapturingVercelServerEventsForTests();
    const logs = captureContactLogs();
    const slowStarted = Date.now();
    const slowAccepted = await POST(request(payload));
    const slowElapsed = Date.now() - slowStarted;
    assert.equal(slowAccepted.status, 201);
    assert.deepEqual(await slowAccepted.json(), { ok: true, accepted: true });
    assert.ok(
      slowElapsed < 500,
      `slow DB/analytics must not block the 201 (${slowElapsed}ms)`,
    );
    await flushContactAfterTasksForTests();
    logs.restore();
    const persistElapsed = Date.now() - persistStartedAt;
    const stillPendingElapsed = logs.stillPendingAt - persistStartedAt;
    assert.ok(persistStartedAt > 0, "slow persist must start the DB write");
    assert.ok(logs.stillPendingAt > 0, "still-pending log must be timestamped");
    assert.ok(
      stillPendingElapsed >= 1_900 && stillPendingElapsed <= 3_000,
      `still-pending real-timer smoke must be 1900-3000ms from persist start (${stillPendingElapsed}ms)`,
    );
    assert.ok(
      persistElapsed < 4_000,
      `after() must finish the 2.2s write, not the 25s abandon (${persistElapsed}ms)`,
    );
    const pendingIdx = logs.lines.findIndex((line) =>
      line.includes("[contact] persist timed out, still pending"),
    );
    const failedIdx = logs.lines.findIndex((line) =>
      line.includes("[contact] persist failed:"),
    );
    assert.ok(pendingIdx >= 0, `still-pending log missing: ${JSON.stringify(logs.lines)}`);
    assert.ok(failedIdx > pendingIdx, `failed must follow still pending: ${JSON.stringify(logs.lines)}`);
    assert.equal(
      logs.lines.some((line) => line.includes("[contact] persist landed")),
      false,
      "timeout must not log landed",
    );
    const slowEvents = takeVercelServerEventsForTests();
    assert.equal(slowEvents.length, 1);
    assert.equal(slowEvents[0].name, "contact_form_submit");
    if (hangTimer) clearTimeout(hangTimer);

    const preciseLines: string[] = [];
    let rejectWrite: ((error: unknown) => void) | undefined;
    storage.createContactMessage = () =>
      new Promise((_, reject) => {
        rejectWrite = reject;
      });
    const originalWarn = console.warn;
    const originalError = console.error;
    console.warn = (...args: unknown[]) => {
      preciseLines.push(args.map(String).join(" "));
      originalWarn.apply(console, args);
    };
    console.error = (...args: unknown[]) => {
      preciseLines.push(args.map(String).join(" "));
      originalError.apply(console, args);
    };
    const timers = installFakeTimers();
    try {
      startCapturingVercelServerEventsForTests();
      const preciseAccepted = await POST(request(payload));
      assert.equal(preciseAccepted.status, 201);
      const preciseFlush = flushContactAfterTasksForTests();
      await yieldMicrotasks(10);
      await timers.tick(1_999);
      assert.equal(hasStillPending(preciseLines), false, "still-pending must not log at tick 1999");
      await timers.tick(1);
      assert.equal(hasStillPending(preciseLines), true, "still-pending must log at tick 2000");
      assert.ok(rejectWrite, "precise persist must start the DB write");
      rejectWrite(new Error("slow DB must be bounded, not awaited to completion"));
      await yieldMicrotasks(8);
      await preciseFlush;
      takeVercelServerEventsForTests();
    } finally {
      timers.restore();
      console.warn = originalWarn;
      console.error = originalError;
    }
    storage.createContactMessage = originalCreate;

    const landedLogs = captureContactLogs();
    startCapturingVercelServerEventsForTests();
    const fastLanded = await POST(request(payload));
    assert.equal(fastLanded.status, 201);
    await flushContactAfterTasksForTests();
    landedLogs.restore();
    assert.ok(
      landedLogs.lines.some((line) => line.includes("[contact] persist landed")),
      `landed log missing: ${JSON.stringify(landedLogs.lines)}`,
    );
    takeVercelServerEventsForTests();

    let persistStarted = 0;
    let persistEnded = 0;
    let analyticsStarted = 0;
    let analyticsEnded = 0;
    storage.createContactMessage = async (data) => {
      persistStarted = Date.now();
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 80);
      });
      persistEnded = Date.now();
      return originalCreate.call(storage, data);
    };
    mockTrackVercelServerEventForTests(async () => {
      analyticsStarted = Date.now();
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 80);
      });
      analyticsEnded = Date.now();
    });
    startCapturingVercelServerEventsForTests();
    const overlapAccepted = await POST(request(payload));
    assert.equal(overlapAccepted.status, 201);
    await flushContactAfterTasksForTests();
    takeVercelServerEventsForTests();
    assert.ok(persistStarted > 0 && analyticsStarted > 0, "persist and analytics must both start");
    assert.ok(
      persistStarted < analyticsEnded && analyticsStarted < persistEnded,
      `persist and analytics must overlap (p=${persistStarted}-${persistEnded} a=${analyticsStarted}-${analyticsEnded})`,
    );
    storage.createContactMessage = originalCreate;
    mockTrackVercelServerEventForTests(null);

    mockTrackVercelServerEventForTests(async () => {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 5_000);
      });
    });
    startCapturingVercelServerEventsForTests();
    const delayedAnalyticsStarted = Date.now();
    const delayedAnalytics = await POST(request(payload));
    const delayedAnalyticsElapsed = Date.now() - delayedAnalyticsStarted;
    assert.equal(delayedAnalytics.status, 201);
    assert.ok(
      delayedAnalyticsElapsed < 500,
      `awaited analytics must not block the 201 (${delayedAnalyticsElapsed}ms)`,
    );
    await flushContactAfterTasksForTests();
    mockTrackVercelServerEventForTests(null);

    let unhandled = 0;
    const onUnhandled = (): void => {
      unhandled += 1;
    };
    process.on("unhandledRejection", onUnhandled);
    mockTrackVercelServerEventForTests(async () => {
      throw new Error("egg-analytics-throw");
    });
    startCapturingVercelServerEventsForTests();
    const thrown = await POST(request(payload));
    assert.equal(thrown.status, 201);
    await flushContactAfterTasksForTests();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(unhandled, 0, "analytics throw must not become an unhandled rejection");
    process.off("unhandledRejection", onUnhandled);
    mockTrackVercelServerEventForTests(null);

    let trackUnhandled = 0;
    const onTrackUnhandled = (): void => {
      trackUnhandled += 1;
    };
    process.on("unhandledRejection", onTrackUnhandled);
    mockTrackVercelServerEventForTests(async () => {
      throw new Error("egg-direct-analytics-throw");
    });
    await trackVercelServerEvent(request(payload), "contact_form_submit", { form_name: "contact_form" });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(trackUnhandled, 0, "trackVercelServerEvent try/catch must swallow throws");
    process.off("unhandledRejection", onTrackUnhandled);
    mockTrackVercelServerEventForTests(null);

    inboxStatus = 503;
    inboxBody = { ok: false };
    const statusArgs: unknown[] = [];
    const statusError = console.error;
    console.error = (...args: unknown[]) => {
      statusArgs.push(...args);
      statusError.apply(console, args);
    };
    startCapturingVercelServerEventsForTests();
    const rejectedStatus = await POST(request(payload));
    assert.equal(rejectedStatus.status, 500);
    console.error = statusError;
    await flushContactAfterTasksForTests();
    takeVercelServerEventsForTests();
    assert.equal(
      statusArgs.includes(503),
      true,
      `Formspree HTTP status must be logged as a number: ${JSON.stringify(statusArgs)}`,
    );
    inboxStatus = 200;
    inboxBody = { ok: true };

    const savedNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    let prodPersistCalls = 0;
    storage.createContactMessage = async (data) => {
      prodPersistCalls += 1;
      return originalCreate.call(storage, data);
    };
    const prodLines: string[] = [];
    const prodError = console.error;
    console.error = (...args: unknown[]) => {
      prodLines.push(args.map(String).join(" "));
      prodError.apply(console, args);
    };
    startCapturingVercelServerEventsForTests();
    const prodAccepted = await POST(request(payload));
    assert.equal(prodAccepted.status, 201);
    await flushContactAfterTasksForTests();
    takeVercelServerEventsForTests();
    console.error = prodError;
    if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = savedNodeEnv;
    storage.createContactMessage = originalCreate;
    assert.equal(prodPersistCalls, 0, "prod must not retain a detached after() fallback");
    assert.ok(
      prodLines.some((line) => line.includes("[contact] after() unavailable:")),
      `after() unavailable log missing in prod: ${JSON.stringify(prodLines)}`,
    );
    assert.equal(
      prodLines.some((line) => line.includes("next-dynamic-api-wrong-context")),
      false,
      "after() unavailable must not log the raw Next message",
    );

    console.log("Contact accepted-delivery contract checks passed.");
  } finally {
    mockTrackVercelServerEventForTests(null);
    globalThis.fetch = originalFetch;
    storage.createContactMessage = originalCreate;
    for (const key of Object.keys(process.env)) if (!(key in savedEnv)) delete process.env[key];
    Object.assign(process.env, savedEnv);
    takeVercelServerEventsForTests();
    await flushContactAfterTasksForTests();
  }
}

let settled = false;
process.on("beforeExit", () => {
  if (!settled) {
    console.error("contact contract run never settled");
    process.exitCode = 1;
  }
});

async function main(): Promise<void> {
  try {
    await run();
    settled = true;
  } catch (error) {
    settled = true;
    console.error(error);
    process.exitCode = 1;
  }
}

void main();
