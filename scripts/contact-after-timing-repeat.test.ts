import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/contact/route";
import {
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

const REPEAT = 50;

async function run(): Promise<void> {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  const originalError = console.error;
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

  try {
    assert.equal(CONTACT_DB_TIMEOUT_MS, 2_000);
    mockTrackVercelServerEventForTests(async () => undefined);
    for (let i = 0; i < REPEAT; i += 1) {
      const lines: string[] = [];
      let rejectWrite: ((error: unknown) => void) | undefined;
      storage.createContactMessage = () =>
        new Promise((_, reject) => {
          rejectWrite = reject;
        });
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
        await yieldMicrotasks(10);
        await timers.tick(1_999);
        assert.equal(
          hasStillPending(lines),
          false,
          `repeat ${i + 1}/${REPEAT} still-pending must not log at tick 1999`,
        );
        await timers.tick(1);
        assert.equal(
          hasStillPending(lines),
          true,
          `repeat ${i + 1}/${REPEAT} still-pending must log at tick 2000`,
        );
        assert.ok(rejectWrite, `repeat ${i + 1}/${REPEAT} persist never started`);
        rejectWrite(new Error("slow DB must be bounded, not awaited to completion"));
        await yieldMicrotasks(8);
        await flush;
        takeVercelServerEventsForTests();
      } finally {
        timers.restore();
        console.warn = originalWarn;
        console.error = originalError;
      }
    }
    console.log(`Contact after() still-pending timing: ${REPEAT}/${REPEAT} ok (fake 1999/2000).`);
  } finally {
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
