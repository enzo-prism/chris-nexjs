import assert from "node:assert/strict";
import { installFakeTimers } from "./contact-fake-timers";

async function run(): Promise<void> {
  const one = new Error("synthetic-timer-one");
  const two = new Error("synthetic-timer-two");
  const timers = installFakeTimers();
  try {
    setTimeout(() => {
      throw one;
    }, 10);
    await assert.rejects(
      () => timers.tick(10),
      (error: unknown) => {
        assert.equal(error, one, "one throw must reject with the same error");
        return true;
      },
    );

    setTimeout(() => {
      throw one;
    }, 5);
    setTimeout(() => {
      throw two;
    }, 10);
    await assert.rejects(
      () => timers.tick(10),
      (error: unknown) => {
        assert.ok(error instanceof AggregateError, "two throws must be an AggregateError");
        assert.deepEqual(error.errors, [one, two]);
        return true;
      },
    );
    console.log("Contact fake-timer callback error checks passed.");
  } finally {
    timers.restore();
  }
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
