import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const STATIC_SCRIPTS = ["test:seo", "test:seo:freshness"];
const RUNTIME_SCRIPTS = ["test:seo:onpage", "test:seo:links", "test:seo:schema"];
const NEXT_BIN = resolve("node_modules/next/dist/bin/next");

function runPnpmScript(script, extraEnv = {}) {
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

function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
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

async function waitForServer(url, timeoutMs = 90_000) {
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

function descendantPids(pid) {
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

async function stopSeoServer(server) {
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

async function startLocalSeoServer() {
  // Always rebuild so this gate never audits a leftover .next from another branch.
  runPnpmScript("build");

  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [NEXT_BIN, "start", "-H", "127.0.0.1", "-p", String(port)], {
    stdio: ["ignore", "inherit", "inherit"],
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
    },
  });

  try {
    await waitForServer(baseUrl);
  } catch (error) {
    await stopSeoServer(server);
    throw error;
  }

  return { server, baseUrl };
}

async function main() {
  for (const script of STATIC_SCRIPTS) {
    runPnpmScript(script);
  }

  const providedBaseUrl = process.env.SEO_AUDIT_BASE_URL?.trim();
  if (providedBaseUrl) {
    for (const script of RUNTIME_SCRIPTS) {
      runPnpmScript(script, { SEO_AUDIT_BASE_URL: providedBaseUrl });
    }
    return;
  }

  if (!existsSync(NEXT_BIN)) {
    throw new Error("next binary is missing; run pnpm install first");
  }

  const { server, baseUrl } = await startLocalSeoServer();
  const shutdown = async () => {
    await stopSeoServer(server);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  try {
    for (const script of RUNTIME_SCRIPTS) {
      runPnpmScript(script, { SEO_AUDIT_BASE_URL: baseUrl });
    }
  } finally {
    process.off("SIGINT", shutdown);
    process.off("SIGTERM", shutdown);
    await stopSeoServer(server);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
