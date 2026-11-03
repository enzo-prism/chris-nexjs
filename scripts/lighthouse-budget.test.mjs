import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  isPidAlive,
  killChromeForUserDataDir,
  pidsForUserDataDir,
  userDataDirsFromPsLines,
} from "./lighthouse-chrome.mjs";

const require = createRequire(import.meta.url);

function chromeExecutablePath() {
  const candidates = [];
  try {
    const { chromium } = require("@playwright/test");
    if (typeof chromium?.executablePath === "function") {
      candidates.push(chromium.executablePath());
    }
  } catch {
    // Fall through to playwright-core.
  }
  try {
    const { chromium } = require("playwright-core");
    if (typeof chromium?.executablePath === "function") {
      candidates.push(chromium.executablePath());
    }
  } catch {
    // Optional dependency.
  }
  const existing = candidates.find((candidate) => candidate && existsSync(candidate));
  if (!existing) {
    throw new Error(
      `Playwright Chromium is not installed (looked at ${candidates.join(", ") || "no paths"}). Run pnpm exec playwright install chromium.`,
    );
  }
  return existing;
}

function spawnArgvMarker(markers, script = "setInterval(() => {}, 1000)") {
  const flags = [markers].flat();
  const child = spawn(process.execPath, ["-e", script, "--", ...flags], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  return child;
}

function spawnChrome(args) {
  const child = spawn(
    chromeExecutablePath(),
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-first-run",
      ...args,
    ],
    {
      detached: true,
      stdio: "ignore",
    },
  );
  child.unref();
  return child;
}

function termIgnorerScript(userDataDir, readyFile) {
  return `
    const fs = require("node:fs");
    const dir = ${JSON.stringify(userDataDir)};
    process.on("SIGTERM", () => {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(dir + "/rewritten", "term");
    });
    fs.writeFileSync(${JSON.stringify(readyFile)}, "ready");
    setInterval(() => {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(dir + "/heartbeat", "alive");
    }, 30);
  `;
}

async function waitUntil(predicate, timeoutMs = 2_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise((resolve) => {
      setTimeout(resolve, 25);
    });
  }
  throw new Error("timed out waiting for process state");
}

async function unusedPort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((error) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
    server.on("error", reject);
  });
}

describe("lighthouse chrome cleanup", () => {
  it("waits for a ready SIGTERM-ignorer that rewrites its profile, then SIGKILLs and removes the dir", { timeout: 8_000 }, async () => {
    const userDataDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-hang-"));
    const readyFile = join(userDataDir, "ready");
    writeFileSync(join(userDataDir, "Default"), "profile");
    const hung = spawnArgvMarker(
      `--user-data-dir=${userDataDir}`,
      termIgnorerScript(userDataDir, readyFile),
    );

    try {
      await waitUntil(() => existsSync(readyFile));
      assert.equal(isPidAlive(hung.pid), true);
      const started = Date.now();
      const killed = await killChromeForUserDataDir(userDataDir, {
        exitTimeoutMs: 400,
      });
      assert.ok(
        Date.now() - started >= 300,
        "cleanup must wait out SIGTERM before SIGKILL",
      );
      assert.equal(killed.has(hung.pid), true);
      await waitUntil(() => !isPidAlive(hung.pid), 2_000);
      assert.equal(isPidAlive(hung.pid), false);
      assert.equal(existsSync(userDataDir), false);
    } finally {
      try {
        process.kill(hung.pid, "SIGKILL");
      } catch {
        // already gone
      }
      try {
        rmSync(userDataDir, { recursive: true, force: true });
      } catch {
        // already gone
      }
    }
  });

  it("removes this run's argv launcher dir and leaves a during-attempt lighthouse.* Chrome", async () => {
    const kids = [];
    const dirs = [];
    try {
      const attemptDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(attemptDir);
      const thisRunLauncher = mkdtempSync(join(tmpdir(), "lighthouse."));
      dirs.push(thisRunLauncher);
      const otherRunDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-OTHERRUN-"));
      dirs.push(otherRunDir);
      const preexistingLhDir = mkdtempSync(join(tmpdir(), "lighthouse."));
      dirs.push(preexistingLhDir);
      const debugProfile = mkdtempSync(join(tmpdir(), "cw-debug-"));
      dirs.push(debugProfile);
      writeFileSync(join(preexistingLhDir, "Keep"), "unrelated");
      writeFileSync(join(thisRunLauncher, "Launcher"), "this-run");

      const debugPort = await unusedPort();
      kids.push(
        spawnArgvMarker([
          `--user-data-dir=${attemptDir}`,
          `--user-data-dir=${thisRunLauncher}`,
        ]),
      );
      kids.push(
        spawnChrome([
          `--remote-debugging-port=${debugPort}`,
          `--user-data-dir=${debugProfile}`,
        ]),
      );
      kids.push(spawnChrome([`--user-data-dir=${preexistingLhDir}`]));
      kids.push(spawnChrome([`--user-data-dir=${otherRunDir}`]));

      await waitUntil(() => kids.every((child) => isPidAlive(child.pid)));
      assert.equal(
        userDataDirsFromPsLines(
          [
            `${kids[0].pid} node --user-data-dir=${attemptDir} --user-data-dir=${thisRunLauncher}`,
          ],
          new Set([kids[0].pid]),
        ).has(thisRunLauncher),
        true,
      );

      const duringLhDir = mkdtempSync(join(tmpdir(), "lighthouse."));
      dirs.push(duringLhDir);
      writeFileSync(join(duringLhDir, "Keep"), "during");
      kids.push(spawnChrome([`--user-data-dir=${duringLhDir}`]));
      await waitUntil(() => isPidAlive(kids[4].pid));

      const [target, debugChrome, lhBystander, otherRun, duringChrome] = kids;
      const killed = await killChromeForUserDataDir(attemptDir);
      assert.equal(killed.has(target.pid), true);
      assert.equal(killed.has(debugChrome.pid), false);
      assert.equal(killed.has(lhBystander.pid), false);
      assert.equal(killed.has(otherRun.pid), false);
      assert.equal(killed.has(duringChrome.pid), false);

      await waitUntil(() => !isPidAlive(target.pid));
      assert.equal(existsSync(attemptDir), false);
      assert.equal(existsSync(thisRunLauncher), false);
      assert.equal(isPidAlive(debugChrome.pid), true);
      assert.equal(isPidAlive(lhBystander.pid), true);
      assert.equal(existsSync(preexistingLhDir), true);
      assert.equal(isPidAlive(otherRun.pid), true);
      assert.equal(existsSync(otherRunDir), true);
      assert.equal(isPidAlive(duringChrome.pid), true);
      assert.equal(existsSync(duringLhDir), true);
      assert.equal(existsSync(join(duringLhDir, "Keep")), true);
      assert.equal(
        pidsForUserDataDir(
          [`${debugChrome.pid} chrome --remote-debugging-port=${debugPort}`],
          attemptDir,
        ).size,
        0,
      );
    } finally {
      for (const child of kids) {
        try {
          process.kill(child.pid, "SIGKILL");
        } catch {
          // already gone
        }
      }
      for (const dir of dirs) {
        try {
          rmSync(dir, { recursive: true, force: true });
        } catch {
          // already gone
        }
      }
    }
  });

  it("awaits cleanup in the Lighthouse finally block", () => {
    const budget = readFileSync("scripts/lighthouse-budget.mjs", "utf8");
    assert.match(budget, /await killChromeForUserDataDir\(userDataDir\)/);
    assert.doesNotMatch(budget, /createdLauncherDirs\(/);
  });
});
