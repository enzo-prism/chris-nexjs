import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

import {
  NEXT_BIN,
  NEXT_START_ARGS,
  SEO_BIND_HOST,
  createSeoProcessTracker,
  isPidAlive,
  runSeoAll,
  startLocalSeoServer,
  stopSeoServer,
} from "./seo-all-lib.mjs";

function hangingChild() {
  return spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
    stdio: "ignore",
    detached: true,
  });
}

function exitingChild(code = 0) {
  return spawn(process.execPath, ["-e", `process.exit(${code})`], {
    stdio: "ignore",
    detached: true,
  });
}

async function settle(run: Promise<unknown>, timeoutMs = 2_000): Promise<void> {
  await Promise.race([
    run.catch(() => undefined),
    delay(timeoutMs),
  ]);
}

async function waitFor(predicate: () => boolean, timeoutMs = 2_000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (predicate()) return;
    await delay(20);
  }
  throw new Error("timed out waiting for condition");
}

function reapIfAlive(child: ReturnType<typeof spawn> | undefined): void {
  const pid = child?.pid;
  if (!pid || !isPidAlive(pid)) return;
  try {
    process.kill(-pid, "SIGKILL");
  } catch {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // already gone
    }
  }
}

function assertLoopbackStartArgs(args: readonly string[]): void {
  assert.ok(args.includes("start"), "next start must be spawned");
  const hostFlag = args.indexOf("-H");
  assert.notEqual(hostFlag, -1, "next start must pass -H");
  assert.equal(args[hostFlag + 1], "127.0.0.1");
  assert.equal(args.includes("0.0.0.0"), false, "seo-all must not bind beyond 127.0.0.1");
  assert.equal(args.includes("::"), false, "seo-all must not bind IPv6 any");
}

async function testNextStartSpawnBindsLoopbackOnly() {
  const calls: Array<{ cmd: string; args: readonly string[] }> = [];
  const tracker = createSeoProcessTracker();
  const spawnImpl = (cmd: string, args: readonly string[]) => {
    calls.push({ cmd, args });
    return exitingChild();
  };

  try {
    await startLocalSeoServer({
      spawn: spawnImpl,
      track: (child: ReturnType<typeof spawn>) => tracker.track(child),
      wait: async () => undefined,
      getPort: async () => 3999,
    });
  } finally {
    await tracker.stopAll();
  }

  assert.equal(SEO_BIND_HOST, "127.0.0.1");
  assert.deepEqual(NEXT_START_ARGS, ["start", "-H", "127.0.0.1"]);
  const startCall = calls.find((call) => call.args.includes("start") && call.args.includes("-H"));
  assert.ok(startCall, "next start spawn args must be recorded");
  assert.equal(startCall.cmd, process.execPath);
  assert.equal(startCall.args[0], NEXT_BIN);
  assertLoopbackStartArgs(startCall.args);
}

async function testStartLocalSeoServerAlwaysRebuilds() {
  const scripts: string[] = [];
  const tracker = createSeoProcessTracker();
  const spawnImpl = (cmd: string, args: readonly string[]) => {
    if (cmd === "pnpm" && args[0] === "run") {
      scripts.push(String(args[1]));
    }
    return exitingChild();
  };

  try {
    await startLocalSeoServer({
      spawn: spawnImpl,
      track: (child: ReturnType<typeof spawn>) => tracker.track(child),
      wait: async () => undefined,
      getPort: async () => 3999,
    });
  } finally {
    await tracker.stopAll();
  }

  assert.equal(scripts.includes("build"), true, "seo-all must spawn pnpm run build before next start");
}

function installSignalRecorder() {
  const handlers: Record<string, ((...args: unknown[]) => unknown) | undefined> = {};
  return {
    handlers,
    on: (event: string, handler: (...args: unknown[]) => unknown) => {
      handlers[event] = handler;
    },
    off: (event: string) => {
      delete handlers[event];
    },
  };
}

async function testSigtermDuringBuildLeavesNoProcessAndDoesNotStartServer() {
  const signals = installSignalRecorder();
  let buildChild: ReturnType<typeof spawn> | undefined;
  let startedServer = false;
  const spawnImpl = (cmd: string, args: readonly string[]) => {
    if (cmd === "pnpm" && args[1] === "build") {
      buildChild = hangingChild();
      return buildChild;
    }
    if (args.includes("start")) {
      startedServer = true;
      throw new Error("server must not start after a stop was requested");
    }
    return exitingChild();
  };

  const run = runSeoAll(
    {},
    {
      spawn: spawnImpl,
      on: signals.on,
      off: signals.off,
      exit: () => undefined,
      getPort: async () => 3999,
      wait: async () => {
        throw new Error("must not wait for a server after a stop");
      },
    },
  );

  try {
    await waitFor(() => Boolean(buildChild?.pid));
    assert.equal(typeof signals.handlers.SIGTERM, "function", "S_noHandler: SIGTERM must be registered before build");
    await signals.handlers.SIGTERM?.();
    await settle(run);

    assert.ok(buildChild?.pid);
    assert.equal(isPidAlive(buildChild.pid), false, "S_noStop: build child must be reaped");
    assert.equal(startedServer, false, "aborted build must never spawn next start");
  } finally {
    reapIfAlive(buildChild);
  }
}

async function testSigtermDuringReadinessLeavesNoProcess() {
  const signals = installSignalRecorder();
  let serverChild: ReturnType<typeof spawn> | undefined;
  const spawnImpl = (cmd: string, args: readonly string[]) => {
    if (cmd === "pnpm" && args[1] === "build") {
      return exitingChild();
    }
    serverChild = hangingChild();
    return serverChild;
  };

  const run = runSeoAll(
    {},
    {
      spawn: spawnImpl,
      on: signals.on,
      off: signals.off,
      exit: () => undefined,
      getPort: async () => 3999,
      wait: async (_url: string, _timeout: number, signal?: AbortSignal) => {
        await new Promise<void>((_resolve, reject) => {
          if (signal?.aborted) {
            reject(new Error("SEO audit interrupted"));
            return;
          }
          signal?.addEventListener(
            "abort",
            () => reject(new Error("SEO audit interrupted")),
            { once: true },
          );
        });
      },
    },
  );

  try {
    await waitFor(() => Boolean(serverChild?.pid));
    assert.equal(typeof signals.handlers.SIGTERM, "function");
    await signals.handlers.SIGTERM?.();
    await settle(run);

    assert.ok(serverChild?.pid);
    assert.equal(isPidAlive(serverChild.pid), false, "readiness child must be tracked and killed");
  } finally {
    reapIfAlive(serverChild);
  }
}

async function testSigtermDuringStaticLeavesNoProcess() {
  const signals = installSignalRecorder();
  let staticChild: ReturnType<typeof spawn> | undefined;
  const spawnImpl = (_cmd: string, args: readonly string[]) => {
    if (args[1] === "test:seo") {
      staticChild = hangingChild();
      return staticChild;
    }
    return exitingChild();
  };

  const run = runSeoAll(
    { SEO_AUDIT_BASE_URL: "http://127.0.0.1:9" },
    {
      spawn: spawnImpl,
      on: signals.on,
      off: signals.off,
      exit: () => undefined,
    },
  );

  try {
    await waitFor(() => Boolean(staticChild?.pid));
    assert.equal(typeof signals.handlers.SIGTERM, "function");
    await signals.handlers.SIGTERM?.();
    await settle(run);

    assert.ok(staticChild?.pid);
    assert.equal(isPidAlive(staticChild.pid), false, "static-check child must be reaped");
  } finally {
    reapIfAlive(staticChild);
  }
}

async function testSigtermDuringAuditLeavesNoProcess() {
  const signals = installSignalRecorder();
  let auditChild: ReturnType<typeof spawn> | undefined;
  const spawnImpl = (_cmd: string, args: readonly string[]) => {
    if (args[1] === "test:seo:onpage") {
      auditChild = hangingChild();
      return auditChild;
    }
    return exitingChild();
  };

  const run = runSeoAll(
    { SEO_AUDIT_BASE_URL: "http://127.0.0.1:9" },
    {
      spawn: spawnImpl,
      on: signals.on,
      off: signals.off,
      exit: () => undefined,
    },
  );

  try {
    await waitFor(() => Boolean(auditChild?.pid));
    assert.equal(typeof signals.handlers.SIGTERM, "function");
    await signals.handlers.SIGTERM?.();
    await settle(run);

    assert.ok(auditChild?.pid);
    assert.equal(isPidAlive(auditChild.pid), false, "runtime audit child must be reaped");
  } finally {
    reapIfAlive(auditChild);
  }
}

async function testStopSeoServerKillsProcessGroup() {
  const child = hangingChild();
  assert.ok(child.pid);
  await stopSeoServer(child);
  assert.equal(isPidAlive(child.pid), false);
}

await testNextStartSpawnBindsLoopbackOnly();
await testStartLocalSeoServerAlwaysRebuilds();
await testSigtermDuringBuildLeavesNoProcessAndDoesNotStartServer();
await testSigtermDuringReadinessLeavesNoProcess();
await testSigtermDuringStaticLeavesNoProcess();
await testSigtermDuringAuditLeavesNoProcess();
await testStopSeoServerKillsProcessGroup();

console.log("SEO all helper checks passed.");
