import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  classifySourceHostKind,
  isAllowedScheduleSource,
  isAllowedScheduleSourceUrl,
  isExplicitSuccessBody,
  isThisProjectVercelHost,
  parseJsonBody,
  planScheduleSubmitAnalytics,
  readScheduleRequestResult,
  resolveScheduleSourcePolicy,
  SCHEDULE_REQUEST_TIMEOUT_MS,
} from "../shared/scheduleRequestPolicy";

const productionPolicy = resolveScheduleSourcePolicy({ VERCEL_ENV: "production" });
const previewPolicy = resolveScheduleSourcePolicy({ VERCEL_ENV: "preview" });
const localPolicy = resolveScheduleSourcePolicy({ VERCEL_ENV: "" });

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
  assert.equal(readScheduleRequestResult(500, { success: true }).accepted, false);
}

function testLeadPlanKillsFailedAndHoneypotMutants() {
  const accepted = planScheduleSubmitAnalytics(readScheduleRequestResult(201, { success: true }));
  assert.equal(accepted.emitLead, true);
  assert.equal(accepted.emitSuccessEvents, true);

  const failed = planScheduleSubmitAnalytics(readScheduleRequestResult(500, { message: "nope" }));
  assert.equal(failed.emitLead, false, "M1: 500 must not emit generate_lead");
  assert.equal(failed.emitSuccessEvents, false);
  assert.equal(failed.showError, true);

  const honeypot = planScheduleSubmitAnalytics(
    readScheduleRequestResult(200, { ok: true, accepted: false }),
  );
  assert.equal(honeypot.emitLead, false, "S3: honeypot must not emit generate_lead");
  assert.equal(
    honeypot.emitSuccessEvents,
    false,
    "SF2: honeypot must not emit schedule_submit_*",
  );
  assert.equal(honeypot.showConfirmation, true);
}

function testParseJsonBody() {
  assert.deepEqual(parseJsonBody('{"ok":true}'), { ok: true });
  assert.equal(parseJsonBody("<!doctype html>"), "<!doctype html>");
  assert.equal(parseJsonBody(""), null);
}

function testSourceAllowlist() {
  assert.equal(isAllowedScheduleSource(undefined, localPolicy), true);
  assert.equal(isAllowedScheduleSource("", productionPolicy), false);
  assert.equal(isAllowedScheduleSource("schedule_page_form_v2", productionPolicy), true);
  assert.equal(isAllowedScheduleSource("invisalign_consult", productionPolicy), true);
  assert.equal(isAllowedScheduleSource("invisalign-ads", productionPolicy), false);

  assert.equal(isAllowedScheduleSourceUrl(undefined, localPolicy), true);
  assert.equal(isAllowedScheduleSourceUrl("", productionPolicy), false);
  assert.equal(
    isAllowedScheduleSourceUrl("https://www.chriswongdds.com/invisalign-consult", productionPolicy),
    true,
  );
  assert.equal(
    isAllowedScheduleSourceUrl("https://chris-wong-dds.vercel.app/schedule", productionPolicy),
    true,
  );
  assert.equal(
    isAllowedScheduleSourceUrl(
      "https://chris-wong-dds-git-cursor-invisalign-ads-lead-hardening-40e4-enzo-design-prisms-projects.vercel.app/invisalign-consult",
      previewPolicy,
    ),
    true,
  );
  assert.equal(
    isAllowedScheduleSourceUrl("https://other-app.vercel.app/schedule", productionPolicy),
    false,
  );
  assert.equal(
    isAllowedScheduleSourceUrl("https://chris-wong-dds.attacker.vercel.app/", productionPolicy),
    false,
  );
  assert.equal(
    isAllowedScheduleSourceUrl("http://localhost:3210/schedule", productionPolicy),
    false,
  );
  assert.equal(
    isAllowedScheduleSourceUrl("http://localhost:3210/schedule", localPolicy),
    true,
  );
  assert.equal(
    isAllowedScheduleSourceUrl("https://user:pw@www.chriswongdds.com/schedule", productionPolicy),
    false,
  );
  assert.equal(
    isAllowedScheduleSourceUrl("https://user:pw@www.chriswongdds.com/schedule", localPolicy),
    false,
  );
}

function testPreviewHostClassification() {
  assert.equal(
    classifySourceHostKind("https://www.chriswongdds.com/schedule"),
    "production",
  );
  assert.equal(
    classifySourceHostKind("https://chris-wong-dds.vercel.app/schedule"),
    "production",
  );
  assert.equal(
    classifySourceHostKind(
      "https://chris-wong-dds-abc123-enzo-design-prisms-projects.vercel.app/schedule",
    ),
    "preview",
  );
  assert.equal(classifySourceHostKind("https://other-app.vercel.app/"), null);
  assert.equal(
    isThisProjectVercelHost("marketing-site.vercel.app"),
    false,
  );
}

function testFormAlwaysSendsSourceFields() {
  const form = readFileSync("client/src/components/forms/AppointmentForm.tsx", "utf8");
  assert.match(form, /source: requestSource/);
  assert.match(form, /sourceUrl,/);
  assert.match(form, /planScheduleSubmitAnalytics/);
  assert.match(form, /AbortController/);
  assert.match(form, /signal: controller\.signal/);
}

function testSeoAllBindsLoopbackAndRebuilds() {
  const script = readFileSync("scripts/seo-all.mjs", "utf8");
  assert.match(script, /Always rebuild/);
  assert.match(script, /runPnpmScript\("build"\)/);
  assert.match(script, /"-H", "127\.0\.0\.1"/);
  assert.match(script, /descendantPids/);
  assert.match(script, /process\.kill\(pid, "SIGKILL"\)/);
  assert.doesNotMatch(script, /reuseExistingServer|existsSync\("\.next/);
}

testTimeoutBudget();
testExplicitSuccessBodies();
testReadScheduleRequestResult();
testLeadPlanKillsFailedAndHoneypotMutants();
testParseJsonBody();
testSourceAllowlist();
testPreviewHostClassification();
testFormAlwaysSendsSourceFields();
testSeoAllBindsLoopbackAndRebuilds();

console.log("Schedule request result checks passed.");
