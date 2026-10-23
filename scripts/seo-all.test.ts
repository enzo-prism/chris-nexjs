import assert from "node:assert/strict";
import { spawn } from "node:child_process";

import {
  NEXT_START_ARGS,
  SEO_BIND_HOST,
  createSeoAuditShutdown,
  ensureFreshSeoBuild,
} from "./seo-all-lib.mjs";

function testNextStartBindsLoopback() {
  assert.deepEqual(NEXT_START_ARGS, ["start", "-H", "127.0.0.1"]);
  assert.equal(SEO_BIND_HOST, "127.0.0.1");
}

function testEnsureFreshSeoBuildAlwaysRebuilds() {
  let builds = 0;
  ensureFreshSeoBuild(() => {
    builds += 1;
  });
  ensureFreshSeoBuild(() => {
    builds += 1;
  });
  assert.equal(builds, 2, "seo-all must rebuild instead of reusing a stale .next");
}

async function testSigtermMidAuditExitsNonZeroAndCleansUp() {
  let stopped = 0;
  let exitCode: number | null = null;
  const abortController = new AbortController();
  const shutdown = createSeoAuditShutdown({
    abortController,
    stopServer: async () => {
      stopped += 1;
    },
    exit: (code) => {
      exitCode = code;
    },
  });

  await shutdown();
  assert.equal(abortController.signal.aborted, true);
  assert.equal(stopped, 1);
  assert.equal(exitCode, 1);

  await shutdown();
  assert.equal(stopped, 1, "shutdown must be idempotent");
}

async function testSigtermKillsSpawnedAuditChild() {
  const child = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
    stdio: "ignore",
  });
  const pid = child.pid;
  assert.ok(pid);

  const exitPromise = new Promise<number | null>((resolve) => {
    child.once("exit", (code) => resolve(code));
  });

  const abortController = new AbortController();
  const shutdown = createSeoAuditShutdown({
    abortController,
    stopServer: async () => {
      try {
        process.kill(pid, "SIGTERM");
      } catch {
        // already gone
      }
      await Promise.race([
        exitPromise,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`child ${pid} still running after SIGTERM`)), 2_000);
        }),
      ]);
    },
    exit: () => undefined,
  });

  await shutdown();
  assert.equal(abortController.signal.aborted, true);
  let stillAlive = true;
  try {
    process.kill(pid, 0);
  } catch {
    stillAlive = false;
  }
  assert.equal(stillAlive, false, "SIGTERM mid-audit must reap the spawned child");
}

await testNextStartBindsLoopback();
await testEnsureFreshSeoBuildAlwaysRebuilds();
await testSigtermMidAuditExitsNonZeroAndCleansUp();
await testSigtermKillsSpawnedAuditChild();

console.log("SEO all helper checks passed.");
