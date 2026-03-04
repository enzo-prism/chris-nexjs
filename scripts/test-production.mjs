import { spawn, spawnSync } from "node:child_process";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const DEFAULT_PORT = Number.parseInt(process.env.PRODUCTION_TEST_PORT || "3000", 10);
const BASE_URL = (process.env.PRODUCTION_TEST_BASE_URL || `http://localhost:${DEFAULT_PORT}`).replace(
  /\/+$/,
  "",
);

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

    await delay(1_000);
  }

  throw new Error(`Timed out waiting for server at ${url}`);
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

async function main() {
  runPnpmScript("check");
  runPnpmScript("test:bundle");
  runPnpmScript("test:api");
  runPnpmScript("test:routes");
  runPnpmScript("test:design-system");

  // Ensure a fresh production build exists for `next start`.
  runPnpmScript("build");

  const server = spawn("pnpm", ["run", "start"], {
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: String(DEFAULT_PORT),
    },
  });

  const shutdown = async () => {
    await stopServer(server);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  try {
    await waitForServer(BASE_URL);
    runPnpmScript("test:images", { IMAGE_AUDIT_BASE_URL: BASE_URL });
    runPnpmScript("test:seo:all", { SEO_AUDIT_BASE_URL: BASE_URL });
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
