import assert from "node:assert/strict";

import {
  isAllowedScheduleSource,
  isAllowedScheduleSourceUrl,
  isExplicitSuccessBody,
  parseJsonBody,
  readScheduleRequestResult,
  SCHEDULE_REQUEST_TIMEOUT_MS,
} from "../shared/scheduleRequestPolicy";

function testTimeoutBudget() {
  assert.equal(SCHEDULE_REQUEST_TIMEOUT_MS, 15_000);
}

function testExplicitSuccessBodies() {
  assert.equal(isExplicitSuccessBody({ success: true }), true);
  assert.equal(isExplicitSuccessBody({ ok: true }), true);
  assert.equal(isExplicitSuccessBody({ success: false }), false);
  assert.equal(isExplicitSuccessBody({ ok: true, accepted: false }), false);
  assert.equal(isExplicitSuccessBody({ ok: true, lead: false }), false);
  assert.equal(isExplicitSuccessBody("<html>Thanks</html>"), false);
  assert.equal(isExplicitSuccessBody(null), false);
  assert.equal(isExplicitSuccessBody({}), false);
}

function testReadScheduleRequestResult() {
  assert.deepEqual(readScheduleRequestResult(201, { success: true }), {
    accepted: true,
    neutral: false,
  });
  assert.deepEqual(readScheduleRequestResult(200, { ok: true }), {
    accepted: true,
    neutral: false,
  });
  assert.equal(readScheduleRequestResult(200, { success: false }).accepted, false);
  assert.equal(readScheduleRequestResult(200, { success: false }).neutral, false);
  assert.deepEqual(readScheduleRequestResult(200, { ok: true, accepted: false }), {
    accepted: false,
    neutral: true,
  });
  assert.equal(readScheduleRequestResult(200, "<html>ok</html>").accepted, false);
  assert.equal(readScheduleRequestResult(200, "<html>ok</html>").neutral, false);
  assert.equal(readScheduleRequestResult(500, { message: "nope" }).accepted, false);
  assert.equal(readScheduleRequestResult(500, { success: true }).accepted, false);
}

function testParseJsonBody() {
  assert.deepEqual(parseJsonBody('{"ok":true}'), { ok: true });
  assert.equal(parseJsonBody("<!doctype html>"), "<!doctype html>");
  assert.equal(parseJsonBody(""), null);
}

function testSourceAllowlist() {
  assert.equal(isAllowedScheduleSource(undefined), true);
  assert.equal(isAllowedScheduleSource("schedule_page_form_v2"), true);
  assert.equal(isAllowedScheduleSource("invisalign_consult"), true);
  assert.equal(isAllowedScheduleSource("invisalign-ads"), false);
  assert.equal(isAllowedScheduleSource("evil"), false);

  assert.equal(isAllowedScheduleSourceUrl(undefined), true);
  assert.equal(
    isAllowedScheduleSourceUrl("https://www.chriswongdds.com/invisalign-consult"),
    true,
  );
  assert.equal(isAllowedScheduleSourceUrl("https://chriswongdds.com/schedule"), true);
  assert.equal(isAllowedScheduleSourceUrl("http://localhost:3210/schedule"), true);
  assert.equal(isAllowedScheduleSourceUrl("https://evil.example/phish"), false);
  assert.equal(
    isAllowedScheduleSourceUrl("https://chriswongdds.com.evil.example/"),
    false,
  );
}

testTimeoutBudget();
testExplicitSuccessBodies();
testReadScheduleRequestResult();
testParseJsonBody();
testSourceAllowlist();

console.log("Schedule request result checks passed.");
