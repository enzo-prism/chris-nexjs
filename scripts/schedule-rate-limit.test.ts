import assert from "node:assert/strict";

import {
  consumeScheduleRequestSlot,
  getTrustedClientIp,
  inspectScheduleRequestRateLimitForTests,
  resetScheduleRequestRateLimitForTests,
  SCHEDULE_REQUEST_RATE_LIMIT,
} from "../server/scheduleRateLimit";

function testTrustedIpPrefersRealIpOverFirstXff() {
  const headers = new Headers({
    "x-forwarded-for": "203.0.113.1, 198.51.100.1",
    "x-real-ip": "198.51.100.50",
  });
  assert.equal(getTrustedClientIp(headers), "198.51.100.50");
}

function testUnknownAndMissingIpsAreNotKeys() {
  resetScheduleRequestRateLimitForTests();
  assert.deepEqual(consumeScheduleRequestSlot(null), {
    allowed: true,
    retryAfterSeconds: 0,
  });
  assert.deepEqual(consumeScheduleRequestSlot("unknown"), {
    allowed: true,
    retryAfterSeconds: 0,
  });
  assert.equal(inspectScheduleRequestRateLimitForTests().size, 0);
}

function testExpiredKeysAreEvicted() {
  resetScheduleRequestRateLimitForTests();
  const now = Date.now();
  consumeScheduleRequestSlot("198.51.100.10", now);
  consumeScheduleRequestSlot("198.51.100.11", now);
  assert.equal(inspectScheduleRequestRateLimitForTests().size, 2);

  consumeScheduleRequestSlot(
    "198.51.100.12",
    now + SCHEDULE_REQUEST_RATE_LIMIT.windowMs + 1,
  );
  const remaining = [...inspectScheduleRequestRateLimitForTests().keys()];
  assert.deepEqual(remaining, ["198.51.100.12"]);
}

testTrustedIpPrefersRealIpOverFirstXff();
testUnknownAndMissingIpsAreNotKeys();
testExpiredKeysAreEvicted();

console.log("Schedule rate-limit checks passed.");
