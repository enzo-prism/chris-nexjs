import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/contact/route";
import {
  CONTACT_DB_ABANDON_MS,
  CONTACT_DB_TIMEOUT_MS,
  flushContactAfterTasksForTests,
} from "../server/contactFollowUp";
import { getStorage } from "../server/storage/repository";
import {
  mockTrackVercelServerEventForTests,
  startCapturingVercelServerEventsForTests,
  takeVercelServerEventsForTests,
} from "../server/vercelAnalytics";
import { hasStillPending, installFakeTimers, yieldMicrotasks } from "./contact-fake-timers";

const payload = {
  fullName: "Contact Example",
  email: "contact.example@example.com",
  phone: "6505550100",
  subject: "services",
  message: "Synthetic local contract check.",
};

async function run(): Promise<void> {
  assert.equal(CONTACT_DB_TIMEOUT_MS, 2_000);
  assert.equal(CONTACT_DB_ABANDON_MS, 25_000);
  const originalFetch = globalThis.fetch;
  const savedEnv = { ...process.env };
  delete process.env.DATABASE_URL;
  delete process.env.VERCEL_URL;
  delete process.env.VERCEL_WEB_ANALYTICS_ENDPOINT;
  process.env.VERCEL_ENV = "production";
  const storage = await getStorage();
  const originalCreate = storage.createContactMessage;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  const lines: string[] = [];
  const originalWarn = console.warn;
  const originalError = console.error;
  console.warn = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
    originalWarn.apply(console, args);
  };
  console.error = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
    originalError.apply(console, args);
  };

  const timers = installFakeTimers();
  try {
    mockTrackVercelServerEventForTests(async () => undefined);
    let persistStarted = false;
    storage.createContactMessage = () => {
      persistStarted = true;
      return new Promise(() => undefined);
    };
    startCapturingVercelServerEventsForTests();
    const accepted = await POST(
      new NextRequest("https://www.chriswongdds.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    );
    assert.equal(accepted.status, 201);
    const flush = flushContactAfterTasksForTests();
    let settled = false;
    void flush.then(() => {
      settled = true;
    });
    await yieldMicrotasks(10);
    assert.equal(persistStarted, true, "hung persist must start the DB write");
    await yieldMicrotasks(2);

    await timers.tick(1_999);
    assert.equal(hasStillPending(lines), false, "still-pending must not log at tick 1999");
    await timers.tick(1);
    assert.equal(hasStillPending(lines), true, "still-pending must log at tick 2000");
    assert.equal(
      lines.some((line) => line.includes("[contact] persist abandoned")),
      false,
      "abandon must not fire at the 2s mark",
    );
    assert.equal(settled, false, "persist must still be awaiting the 25s cap");

    await timers.tick(CONTACT_DB_ABANDON_MS - CONTACT_DB_TIMEOUT_MS);
    await yieldMicrotasks(8);
    assert.equal(settled, true, "persist must settle after the 25s abandon");
    assert.ok(
      lines.some((line) => line.includes("[contact] persist abandoned")),
      `abandon log missing after 25s: ${JSON.stringify(lines)}`,
    );
    await flush;
    takeVercelServerEventsForTests();
    console.log("Contact after() 25s abandon checks passed.");
  } finally {
    timers.restore();
    console.warn = originalWarn;
    console.error = originalError;
    mockTrackVercelServerEventForTests(null);
    globalThis.fetch = originalFetch;
    storage.createContactMessage = originalCreate;
    for (const key of Object.keys(process.env)) if (!(key in savedEnv)) delete process.env[key];
    Object.assign(process.env, savedEnv);
    await flushContactAfterTasksForTests();
  }
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
