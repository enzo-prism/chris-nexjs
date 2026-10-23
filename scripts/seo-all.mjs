import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { existsSync } from "node:fs";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const STATIC_SCRIPTS = ["test:seo", "test:seo:freshness"];
const RUNTIME_SCRIPTS = ["test:seo:onpage", "test:seo:links", "test:seo:schema"];

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
  return new Promise((resolve, reject) => {
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
        resolve(port);
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

async function stopServer(server) {
  if (!server || server.exitCode !== null) return;

  server.kill("SIGTERM");
  const deadline = Date.now() + 10_000;

  while (server.exitCode === null && Date.now() < deadline) {
    await delay(200);
  }

  if (server.exitCode === null) {
    server.kill("SIGKILL");
  }
}

async function startLocalSeoServer() {
  if (!existsSync(".next/BUILD_ID") && !existsSync(".next/build-manifest.json")) {
    runPnpmScript("build");
  }

  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn("pnpm", ["exec", "next", "start", "-p", String(port)], {
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: String(port),
    },
  });

  await waitForServer(baseUrl);
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

  const { server, baseUrl } = await startLocalSeoServer();
  const shutdown = async () => {
    await stopServer(server);
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
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
