import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/contact/route";
import { FORMSPREE_OPS_QA_FIELD } from "../shared/formspree";
import { getStorage } from "../server/storage/repository";
import {
  startCapturingVercelServerEventsForTests,
  takeVercelServerEventsForTests,
} from "../server/vercelAnalytics";

const payload = {
  fullName: "Contact Example",
  email: "contact.example@example.com",
  phone: "6505550100",
  subject: "services",
  message: "Synthetic local contract check.",
};

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
    startCapturingVercelServerEventsForTests();
    const bot = await POST(request({ company: "spam" }));
    assert.equal(bot.status, 201);
    assert.deepEqual(await bot.json(), { ok: true, accepted: false });
    assert.equal(deliveries.length, 0, "honeypot must not reach the inbox");
    assert.deepEqual(takeVercelServerEventsForTests(), []);
    assert.equal(stored, 0);

    for (const marker of [true, "true"]) {
      startCapturingVercelServerEventsForTests();
      const test = await POST(request({ ...payload, [FORMSPREE_OPS_QA_FIELD]: marker }));
      assert.deepEqual(await test.json(), { ok: true, accepted: false, test: true });
      assert.equal(deliveries.length, 0, "QA submission must not reach the inbox");
      assert.deepEqual(takeVercelServerEventsForTests(), []);
    }

    process.env.VERCEL_ENV = "preview";
    startCapturingVercelServerEventsForTests();
    const preview = await POST(request(payload));
    assert.deepEqual(await preview.json(), { ok: true, accepted: false, preview: true });
    assert.equal(deliveries.length, 0, "preview must not reach the inbox");
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
      [200, "<html>Not an accepted inquiry</html>"],
    ] as const) {
      inboxStatus = status;
      inboxBody = body;
      startCapturingVercelServerEventsForTests();
      const rejected = await POST(request(payload));
      assert.equal(rejected.status, 500, JSON.stringify({ status, body }));
      assert.notEqual((await rejected.json()).accepted, true);
      assert.deepEqual(takeVercelServerEventsForTests(), []);
      assert.equal(stored, 0, "rejected inbox responses must not be persisted");
    }

    inboxStatus = 200;
    inboxBody = { ok: true };
    startCapturingVercelServerEventsForTests();
    const accepted = await POST(request(payload));
    assert.equal(accepted.status, 201);
    assert.deepEqual(await accepted.json(), { ok: true, accepted: true });
    assert.equal(stored, 1, "only the delivered inquiry is persisted");
    const events = takeVercelServerEventsForTests();
    assert.equal(events.length, 1);
    assert.equal(events[0].name, "contact_form_submit");
    assert.equal(events[0].properties.page_path, "/contact");
    assert.equal(JSON.stringify(events).includes(payload.email), false);
    console.log("Contact accepted-delivery contract checks passed.");
  } finally {
    globalThis.fetch = originalFetch;
    storage.createContactMessage = originalCreate;
    for (const key of Object.keys(process.env)) if (!(key in savedEnv)) delete process.env[key];
    Object.assign(process.env, savedEnv);
    takeVercelServerEventsForTests();
  }
}

run().catch((error) => { console.error(error); process.exit(1); });
