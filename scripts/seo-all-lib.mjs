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

export async function waitForServer(url, timeoutMs = 90_000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(5_000),
      });
      if (response.ok) return;
    } catch {
      // keep polling until timeout
    }

    await delay(500);
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

export async function stopSeoServer(server) {
  if (!server || server.pid == null) return;

  const pids = descendantPids(server.pid);
  for (const pid of [...pids].reverse()) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // already gone
    }
  }

  const deadline = Date.now() + 10_000;
  while (server.exitCode === null && Date.now() < deadline) {
    await delay(200);
  }

  for (const pid of [...pids].reverse()) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // already gone
    }
  }
}

export function ensureFreshSeoBuild(runBuild = () => runPnpmScript("build")) {
  runBuild();
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

export function runPnpmScriptAsync(script, extraEnv = {}, signal) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn("pnpm", ["run", script], {
      stdio: "inherit",
      env: {
        ...process.env,
        ...extraEnv,
      },
    });

    const onAbort = () => {
      if (!child.pid) return;
      const pids = descendantPids(child.pid);
      for (const pid of [...pids].reverse()) {
        try {
          process.kill(pid, "SIGTERM");
        } catch {
          // already gone
        }
      }
    };

    if (signal?.aborted) {
      onAbort();
    } else {
      signal?.addEventListener("abort", onAbort, { once: true });
    }

    child.on("exit", (code) => {
      signal?.removeEventListener("abort", onAbort);
      if (signal?.aborted) {
        reject(new Error("SEO audit interrupted"));
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

export async function startLocalSeoServer() {
  ensureFreshSeoBuild();

  const port = await getFreePort();
  const baseUrl = `http://${SEO_BIND_HOST}:${port}`;
  const server = spawn(
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
  );

  try {
    await waitForServer(baseUrl);
  } catch (error) {
    await stopSeoServer(server);
    throw error;
  }

  return { server, baseUrl };
}

export async function runSeoAll(env = process.env) {
  const abortController = new AbortController();
  let server = null;
  const shutdown = createSeoAuditShutdown({
    abortController,
    stopServer: () => stopSeoServer(server),
  });

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  try {
    const providedBaseUrl = env.SEO_AUDIT_BASE_URL?.trim();
    if (providedBaseUrl) {
      for (const script of [...STATIC_SCRIPTS, ...RUNTIME_SCRIPTS]) {
        await runPnpmScriptAsync(
          script,
          { SEO_AUDIT_BASE_URL: providedBaseUrl },
          abortController.signal,
        );
      }
      return;
    }

    for (const script of STATIC_SCRIPTS) {
      await runPnpmScriptAsync(script, {}, abortController.signal);
    }

    if (!existsSync(NEXT_BIN)) {
      throw new Error("next binary is missing; run pnpm install first");
    }

    const started = await startLocalSeoServer();
    server = started.server;
    for (const script of RUNTIME_SCRIPTS) {
      await runPnpmScriptAsync(
        script,
        { SEO_AUDIT_BASE_URL: started.baseUrl },
        abortController.signal,
      );
    }
  } finally {
    process.off("SIGINT", shutdown);
    process.off("SIGTERM", shutdown);
    await stopSeoServer(server);
  }
}
