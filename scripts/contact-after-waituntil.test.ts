import assert from "node:assert/strict";
import { AfterContext } from "next/dist/server/after/after-context";
import { workAsyncStorage } from "next/dist/server/app-render/work-async-storage.external";
import { runAfterResponse } from "../server/contactFollowUp";

async function run(): Promise<void> {
  const waitUntilTasks: Promise<unknown>[] = [];
  let close = (): void => {
    throw new Error("onClose was not installed");
  };
  const afterContext = new AfterContext({
    waitUntil: (task: Promise<unknown>) => {
      waitUntilTasks.push(Promise.resolve(task));
    },
    onClose: (callback: () => void) => {
      close = callback;
    },
    onTaskError: () => undefined,
  });
  const workStore = {
    isStaticGeneration: false,
    page: "/api/contact/route",
    route: "/api/contact",
    afterContext,
    previouslyRevalidatedTags: [] as const,
    refreshTagsByCacheKind: new Map(),
    shouldTrackFetchMetrics: false,
    buildId: "contact-after-waituntil",
    cacheComponentsEnabled: false,
    dev: false,
    runInCleanSnapshot: <R, TArgs extends unknown[]>(
      fn: (...args: TArgs) => R,
      ...args: TArgs
    ): R => fn(...args),
  };

  let ran = false;
  let finishedAt = 0;
  const started = Date.now();
  workAsyncStorage.run(workStore, () => {
    runAfterResponse(async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 80));
      ran = true;
      finishedAt = Date.now();
    });
  });

  assert.ok(
    waitUntilTasks.length > 0,
    "real after() must register work with waitUntil",
  );
  close();
  await Promise.all(waitUntilTasks);
  assert.equal(ran, true, "waitUntil must cover the after() callback");
  assert.ok(
    finishedAt - started >= 70,
    `waitUntil settled before the callback finished (${finishedAt - started}ms)`,
  );
  console.log("Contact after() waitUntil checks passed.");
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
