import assert from "node:assert/strict";
import { readContactRequestResult } from "../shared/contactRequestPolicy";

assert.equal(readContactRequestResult(201, { ok: true, accepted: true }).accepted, true);
for (const body of [
  { ok: true, accepted: false },
  { ok: true, accepted: false, preview: true },
  { ok: true, accepted: true, preview: true },
  { ok: true, accepted: true, test: true },
  { ok: true, accepted: true, _codex_test: "true" },
]) {
  assert.equal(readContactRequestResult(201, body).accepted, false);
}
for (const [status, body] of [
  [500, { ok: true, accepted: true }],
  [201, { ok: true }],
  [201, { id: 1 }],
  [201, { next: "test-redirect-url" }],
  [200, { ok: false, accepted: true }],
  [200, { ok: true, accepted: false, success: false }],
  [200, { ok: true, accepted: true, success: false }],
  [200, { ok: true, accepted: true, lead: false }],
  [200, "<html>not accepted</html>"],
  [200, null],
] as const) {
  assert.throws(() => readContactRequestResult(status, body));
}
console.log("Contact accepted-result checks passed.");
