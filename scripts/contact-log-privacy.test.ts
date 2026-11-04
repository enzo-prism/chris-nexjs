import assert from "node:assert/strict";
import { inspect } from "node:util";
import { drizzle } from "drizzle-orm/pg-proxy";
import { NextRequest } from "next/server";
import { POST } from "../app/api/contact/route";
import {
  describeContactLogError,
  flushContactAfterTasksForTests,
  persistContactMessageAfterResponse,
  runAfterResponse,
} from "../server/contactFollowUp";
import { getStorage } from "../server/storage/repository";
import { contactMessages } from "../shared/schema";
import {
  mockTrackVercelServerEventForTests,
  startCapturingVercelServerEventsForTests,
  takeVercelServerEventsForTests,
} from "../server/vercelAnalytics";
import { installFakeTimers, yieldMicrotasks } from "./contact-fake-timers";

const payload = {
  fullName: "Ada Lovelace Synthetic",
  email: "ada.synthetic@example.com",
  phone: "6505550142",
  subject: "services",
  message: "Please never log this synthetic guest note.",
};

const PII_VALUES = [payload.fullName, payload.email, payload.phone, payload.message] as const;

function stringifyConsoleArg(value: unknown): string {
  if (typeof value === "string") return value;
  return inspect(value, { depth: 8, getters: true, showHidden: true });
}

function captureAllConsole(): {
  readonly lines: string[];
  restore(): void;
} {
  const lines: string[] = [];
  const levels = ["error", "warn", "log", "info", "debug", "trace"] as const;
  const originals = Object.fromEntries(
    levels.map((level) => [level, console[level].bind(console)]),
  ) as Record<(typeof levels)[number], (...args: unknown[]) => void>;
  for (const level of levels) {
    console[level] = (...args: unknown[]) => {
      lines.push(args.map(stringifyConsoleArg).join(" "));
      originals[level](...args);
    };
  }
  return {
    lines,
    restore(): void {
      for (const level of levels) {
        console[level] = originals[level];
      }
    },
  };
}

function assertNoPayload(dumped: string, site: string): void {
  for (const value of PII_VALUES) {
    assert.equal(
      dumped.includes(value),
      false,
      `${site} must not contain ${value}: ${dumped}`,
    );
  }
  assert.equal(dumped.includes("Failed query:"), false, `${site} leaked query text`);
}

async function createSyntheticPgProxyError(): Promise<unknown> {
  const db = drizzle(async () => {
    const cause = new Error(`duplicate key: ${payload.email}`);
    cause.name = "PostgresError";
    Object.assign(cause, {
      code: "23505",
      constraint: payload.email,
      detail: `Key (email)=(${payload.email}) already exists. ${payload.fullName} ${payload.phone} ${payload.message}`,
    });
    throw cause;
  });
  try {
    await db.insert(contactMessages).values({
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      subject: payload.subject,
      message: payload.message,
    });
  } catch (error) {
    return error;
  }
  throw new Error("pg-proxy insert must fail");
}

function request(): NextRequest {
  return new NextRequest("https://www.chriswongdds.com/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function run(): Promise<void> {
  const originalFetch = globalThis.fetch;
  const savedEnv = { ...process.env };
  delete process.env.DATABASE_URL;
  delete process.env.VERCEL_URL;
  delete process.env.VERCEL_WEB_ANALYTICS_ENDPOINT;
  process.env.VERCEL_ENV = "production";
  const storage = await getStorage();
  const originalCreate = storage.createContactMessage;
  const drizzleError = await createSyntheticPgProxyError();
  assert.equal(
    describeContactLogError(drizzleError),
    "Error 23505",
    "prod drizzle pg-proxy 23505 must sanitize to Error 23505",
  );
  assert.equal(
    describeContactLogError({
      name: "Error",
      cause: { code: payload.phone, detail: payload.message },
    }),
    "Error",
    "10-digit phone cause.code must not be logged",
  );
  assert.equal(
    describeContactLogError({
      name: "Error",
      cause: { code: 6_505_550_100, detail: payload.message },
    }),
    "Error",
    "numeric phone cause.code must not be logged",
  );
  assert.equal(
    describeContactLogError({
      name: "Error",
      cause: { code: payload.email, detail: payload.message },
    }),
    "Error",
    "email cause.code must not be logged",
  );
  assert.equal(
    describeContactLogError({ name: "JohnSmithError" }),
    "Error",
    "JohnSmithError must not pass the name allowlist",
  );
  const templatedName = `${"Guest"}RecordError`;
  assert.equal(
    describeContactLogError({ name: templatedName }),
    "Error",
    "template-literal error name must not pass the name allowlist",
  );
  const timeout = new DOMException("The operation timed out", "TimeoutError");
  assert.equal(timeout.code, 23, "DOMException TimeoutError uses numeric code 23");
  assert.equal(
    describeContactLogError(timeout),
    "TimeoutError",
    "DOMException numeric code 23 is not SQLSTATE and must be dropped",
  );
  assert.equal(
    describeContactLogError({ name: "Error", code: "23505" }),
    "Error",
    "top-level code must not be logged; SQLSTATE comes from cause only",
  );
  assert.equal(
    describeContactLogError({ name: "Error", cause: { code: "23505" } }),
    "Error 23505",
    "Postgres-set cause.code SQLSTATE must still be logged",
  );
  const inboxOk: typeof fetch = async () =>
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  try {
    mockTrackVercelServerEventForTests(async () => undefined);
    globalThis.fetch = inboxOk;

    storage.createContactMessage = async () => {
      throw drizzleError;
    };
    startCapturingVercelServerEventsForTests();
    const immediateLogs = captureAllConsole();
    const accepted = await POST(request());
    assert.equal(accepted.status, 201);
    await flushContactAfterTasksForTests();
    immediateLogs.restore();
    takeVercelServerEventsForTests();
    assertNoPayload(immediateLogs.lines.join("\n"), "immediate persist fail :113");
    assert.ok(
      immediateLogs.lines.some((line) => line.includes("[contact] persist failed:")),
      "immediate persist failed tag missing",
    );
    assert.ok(
      immediateLogs.lines.some((line) => line.includes("[contact] after() unavailable:")),
      "after() unavailable :84 missing",
    );
    assert.equal(
      immediateLogs.lines.join("\n").includes("next-dynamic-api-wrong-context"),
      false,
      "after() unavailable must not log the raw Next message",
    );

    const followUpLogs = captureAllConsole();
    runAfterResponse(async () => {
      throw drizzleError;
    });
    await flushContactAfterTasksForTests();
    followUpLogs.restore();
    assertNoPayload(followUpLogs.lines.join("\n"), "after() follow-up :78");
    assert.ok(
      followUpLogs.lines.some((line) => line.includes("[contact] after() follow-up failed:")),
      "after() follow-up failed tag missing",
    );

    const persistPayload = {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      subject: payload.subject,
      message: payload.message,
    };
    let rejectLate: ((error: unknown) => void) | undefined;
    storage.createContactMessage = () =>
      new Promise((_, reject) => {
        rejectLate = reject;
      });
    const lateLogs = captureAllConsole();
    const lateTimers = installFakeTimers();
    try {
      runAfterResponse(async () => {
        await persistContactMessageAfterResponse(persistPayload);
      });
      const lateFlush = flushContactAfterTasksForTests();
      await yieldMicrotasks(10);
      await lateTimers.tick(2_000);
      assert.ok(rejectLate, "late persist must start");
      rejectLate(drizzleError);
      await yieldMicrotasks(8);
      await lateFlush;
    } finally {
      lateTimers.restore();
      lateLogs.restore();
    }
    assertNoPayload(lateLogs.lines.join("\n"), "late persist fail :138");
    assert.ok(
      lateLogs.lines.some((line) => line.includes("[contact] persist failed:")),
      "late persist failed tag missing",
    );

    let rejectAbandoned: ((error: unknown) => void) | undefined;
    storage.createContactMessage = () =>
      new Promise((_, reject) => {
        rejectAbandoned = reject;
      });
    const abandonLogs = captureAllConsole();
    const abandonTimers = installFakeTimers();
    try {
      runAfterResponse(async () => {
        await persistContactMessageAfterResponse(persistPayload);
      });
      const abandonFlush = flushContactAfterTasksForTests();
      await yieldMicrotasks(10);
      await abandonTimers.tick(25_000);
      await yieldMicrotasks(8);
      await abandonFlush;
      assert.ok(rejectAbandoned, "abandoned persist must start");
      rejectAbandoned(drizzleError);
      await yieldMicrotasks(8);
    } finally {
      abandonTimers.restore();
      abandonLogs.restore();
    }
    assertNoPayload(abandonLogs.lines.join("\n"), "after-cap persist fail :133");
    assert.ok(
      abandonLogs.lines.some((line) => line.includes("[contact] persist abandoned")),
      "abandon tag missing",
    );
    assert.ok(
      abandonLogs.lines.some((line) => line.includes("[contact] persist failed:")),
      "after-cap persist failed tag missing",
    );

    globalThis.fetch = async () => {
      throw drizzleError;
    };
    const deliverLogs = captureAllConsole();
    const deliver = await POST(request());
    deliverLogs.restore();
    assert.equal(deliver.status, 500);
    assertNoPayload(deliverLogs.lines.join("\n"), "Failed to deliver :193");
    assert.ok(
      deliverLogs.lines.some((line) => line.includes("[contact] Failed to deliver contact message:")),
      "Failed to deliver tag missing",
    );

    const statusPiiError = Object.assign(
      new Error(`Failed query: ${payload.email} ${payload.message}`),
      {
        name: "Error",
        status: 503,
        cause: {
          code: payload.phone,
          detail: `Key (email)=(${payload.email}) ${payload.fullName} ${payload.phone} ${payload.message}`,
          constraint: payload.email,
        },
      },
    );
    globalThis.fetch = async () => {
      throw statusPiiError;
    };
    const statusPiiLogs = captureAllConsole();
    const statusPii = await POST(request());
    statusPiiLogs.restore();
    assert.equal(statusPii.status, 500);
    assertNoPayload(statusPiiLogs.lines.join("\n"), "status branch :187");
    assert.ok(
      statusPiiLogs.lines.some((line) => line.includes("[contact] Failed to deliver contact message:")),
      "status-branch Failed to deliver tag missing",
    );
    assert.ok(
      statusPiiLogs.lines.some((line) => line.includes("503")),
      "status-branch Formspree status number missing",
    );
    assert.equal(
      statusPiiLogs.lines.join("\n").includes("Failed query:"),
      false,
      "status branch :187 leaked raw error text",
    );

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ ok: false }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    const statusArgs: unknown[] = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      statusArgs.push(...args);
      originalError.apply(console, args);
    };
    const statusRes = await POST(request());
    console.error = originalError;
    assert.equal(statusRes.status, 500);
    assert.equal(statusArgs.includes(503), true, `Formspree status number missing: ${inspect(statusArgs)}`);
    assertNoPayload(statusArgs.map(stringifyConsoleArg).join(" "), "Formspree 503");

    console.log("Contact persist privacy checks passed.");
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

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
