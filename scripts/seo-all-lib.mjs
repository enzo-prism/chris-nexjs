import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

export const STATIC_SCRIPTS = ["test:seo", "test:seo:freshness"];
export const RUNTIME_SCRIPTS = ["test:seo:onpage", "test:seo:links", "test:seo:schema"];
export const SEO_BIND_HOST = "127.0.0.1";
export const NEXT_BIN = resolve("node_modules/next/dist/bin/next");
export const NEXT_START_ARGS = ["start", "-H", SEO_BIND_HOST];
export const SEO_AUDIT_INTERRUPTED = "SEO audit interrupted";

export function runPnpmScript(script, extraEnv = {}) {
  const result = spawnSync("pnpm", ["run", script], {
    stdio: "inherit",
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  if (result.status !== 0) {
    throw new Error(`pnpm run ${script} failed with exit code ${result.status ?? 1}`);
  }
}

export function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, SEO_BIND_HOST, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolvePort(port);
      });
    });
  });
}

function throwIfAborted(signal) {
  if (signal?.aborted) {
    throw new Error(SEO_AUDIT_INTERRUPTED);
  }
}

export async function waitForServer(url, timeoutMs = 90_000, signal) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    throwIfAborted(signal);
    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: signal ? AbortSignal.any([AbortSignal.timeout(5_000), signal]) : AbortSignal.timeout(5_000),
      });
      if (response.ok) return;
    } catch (error) {
      throwIfAborted(signal);
      if (error instanceof Error && error.message === SEO_AUDIT_INTERRUPTED) {
        throw error;
      }
      // keep polling until timeout
    }

    try {
      await delay(500, undefined, { signal });
    } catch {
      throwIfAborted(signal);
    }
  }

  throw new Error(`Timed out waiting for SEO audit server at ${url}`);
}

export function descendantPids(pid) {
  const pids = [pid];
  try {
    const children = readFileSync(`/proc/${pid}/task/${pid}/children`, "utf8")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((value) => Number.parseInt(value, 10))
      .filter((value) => Number.isFinite(value));
    for (const child of children) {
      pids.push(...descendantPids(child));
    }
  } catch {
    // process already exited or /proc is unavailable
  }
  return pids;
}

export function isPidAlive(pid) {
  if (pid == null) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function killProcessTree(child, signal = "SIGTERM") {
  if (!child || child.pid == null) return;
  const pid = child.pid;
  try {
    process.kill(-pid, signal);
  } catch {
    try {
      process.kill(pid, signal);
    } catch {
      // already gone
    }
  }
  for (const descendant of [...descendantPids(pid)].reverse()) {
    try {
      process.kill(descendant, signal);
    } catch {
      // already gone
    }
  }
}

export async function stopSeoServer(server) {
  if (!server || server.pid == null) return;
  if (server.exitCode !== null || server.signalCode) return;

  killProcessTree(server, "SIGTERM");

  await Promise.race([
    new Promise((resolve) => {
      if (server.exitCode !== null || server.signalCode) {
        resolve();
        return;
      }
      server.once("exit", resolve);
    }),
    delay(10_000),
  ]);

  if (server.exitCode === null && !server.signalCode) {
    killProcessTree(server, "SIGKILL");
    await Promise.race([
      new Promise((resolve) => server.once("exit", resolve)),
      delay(1_000),
    ]);
  }
}

export function createSeoProcessTracker() {
  const children = [];
  return {
    track(child) {
      if (child) children.push(child);
      return child;
    },
    list() {
      return children.slice();
    },
    async stopAll() {
      const snapshot = children.splice(0, children.length);
      await Promise.all(snapshot.map((child) => stopSeoServer(child)));
    },
  };
}

export function createSeoAuditShutdown({
  abortController,
  stopServer,
  exit = (code) => process.exit(code),
}) {
  let ran = false;
  return async function shutdown() {
    if (ran) return;
    ran = true;
    abortController.abort();
    await stopServer();
    exit(1);
  };
}

export function spawnSeoChild(command, args, options = {}, spawnImpl = spawn) {
  return spawnImpl(command, args, {
    ...options,
    env: options.env ?? process.env,
    stdio: options.stdio ?? "inherit",
    detached: true,
  });
}

export function runPnpmScriptAsync(script, extraEnv = {}, signal, deps = {}) {
  const spawnImpl = deps.spawn ?? spawn;
  const track = deps.track ?? ((child) => child);

  return new Promise((resolvePromise, reject) => {
    if (signal?.aborted) {
      reject(new Error(SEO_AUDIT_INTERRUPTED));
      return;
    }

    const child = track(
      spawnSeoChild(
        "pnpm",
        ["run", script],
        {
          stdio: "inherit",
          env: {
            ...process.env,
            ...extraEnv,
          },
        },
        spawnImpl,
      ),
    );

    const onAbort = () => {
      void stopSeoServer(child);
    };

    if (signal?.aborted) {
      onAbort();
    } else {
      signal?.addEventListener("abort", onAbort, { once: true });
    }

    child.on("exit", (code) => {
      signal?.removeEventListener("abort", onAbort);
      if (signal?.aborted) {
        reject(new Error(SEO_AUDIT_INTERRUPTED));
        return;
      }
      if (code !== 0) {
        reject(new Error(`pnpm run ${script} failed with exit code ${code ?? 1}`));
        return;
      }
      resolvePromise();
    });
  });
}

export async function startLocalSeoServer(deps = {}) {
  const spawnImpl = deps.spawn ?? spawn;
  const track = deps.track ?? ((child) => child);
  const wait = deps.wait ?? waitForServer;
  const getPort = deps.getPort ?? getFreePort;
  const signal = deps.signal;

  throwIfAborted(signal);

  if (deps.runBuild) {
    await deps.runBuild();
  } else {
    await runPnpmScriptAsync("build", {}, signal, { spawn: spawnImpl, track });
  }

  throwIfAborted(signal);

  const port = await getPort();
  const baseUrl = `http://${SEO_BIND_HOST}:${port}`;
  const server = track(
    spawnSeoChild(
      process.execPath,
      [NEXT_BIN, ...NEXT_START_ARGS, "-p", String(port)],
      {
        stdio: ["ignore", "inherit", "inherit"],
        env: {
          ...process.env,
          PORT: String(port),
          HOSTNAME: SEO_BIND_HOST,
        },
      },
      spawnImpl,
    ),
  );

  if (signal?.aborted) {
    await stopSeoServer(server);
    throw new Error(SEO_AUDIT_INTERRUPTED);
  }

  try {
    await wait(baseUrl, 90_000, signal);
  } catch (error) {
    await stopSeoServer(server);
    throw error;
  }

  if (signal?.aborted) {
    await stopSeoServer(server);
    throw new Error(SEO_AUDIT_INTERRUPTED);
  }

  return { server, baseUrl };
}

export async function runSeoAll(env = process.env, deps = {}) {
  const abortController = deps.abortController ?? new AbortController();
  const tracker = deps.tracker ?? createSeoProcessTracker();
  const on = deps.on ?? ((event, handler) => process.on(event, handler));
  const off = deps.off ?? ((event, handler) => process.off(event, handler));
  const exit = deps.exit ?? ((code) => process.exit(code));
  const spawnImpl = deps.spawn ?? spawn;
  const spawnDeps = {
    spawn: spawnImpl,
    track: (child) => tracker.track(child),
  };

  const shutdown = createSeoAuditShutdown({
    abortController,
    stopServer: () => tracker.stopAll(),
    exit,
  });

  on("SIGINT", shutdown);
  on("SIGTERM", shutdown);

  try {
    const providedBaseUrl = env.SEO_AUDIT_BASE_URL?.trim();
    if (providedBaseUrl) {
      for (const script of [...STATIC_SCRIPTS, ...RUNTIME_SCRIPTS]) {
        await runPnpmScriptAsync(
          script,
          { SEO_AUDIT_BASE_URL: providedBaseUrl },
          abortController.signal,
          spawnDeps,
        );
      }
      return;
    }

    for (const script of STATIC_SCRIPTS) {
      await runPnpmScriptAsync(script, {}, abortController.signal, spawnDeps);
    }

    if (!existsSync(NEXT_BIN)) {
      throw new Error("next binary is missing; run pnpm install first");
    }

    const started = await startLocalSeoServer({
      signal: abortController.signal,
      spawn: spawnImpl,
      track: spawnDeps.track,
      wait: deps.wait,
      getPort: deps.getPort,
    });

    for (const script of RUNTIME_SCRIPTS) {
      await runPnpmScriptAsync(
        script,
        { SEO_AUDIT_BASE_URL: started.baseUrl },
        abortController.signal,
        spawnDeps,
      );
    }
  } finally {
    off("SIGINT", shutdown);
    off("SIGTERM", shutdown);
    await tracker.stopAll();
  }
}
