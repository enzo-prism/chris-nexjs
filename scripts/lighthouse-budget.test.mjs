import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createdLauncherDirs,
  isPidAlive,
  killChromeForUserDataDir,
  listLauncherUserDataDirs,
  pidsForUserDataDir,
} from "./lighthouse-chrome.mjs";

const require = createRequire(import.meta.url);

function chromeExecutablePath() {
  try {
    const { chromium } = require("@playwright/test");
    if (typeof chromium?.executablePath === "function") {
      return chromium.executablePath();
    }
  } catch {
    // Fall through to playwright-core.
  }
  const { chromium } = require("playwright-core");
  return chromium.executablePath();
}

function spawnArgvMarker(marker, script = "setInterval(() => {}, 1000)") {
  const child = spawn(process.execPath, ["-e", script, "--", marker], {
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

describe("lighthouse chrome cleanup", () => {
  it("waits for a SIGTERM-ignoring process, SIGKILLs it, then removes the dir", async () => {
    const userDataDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-hang-"));
    writeFileSync(join(userDataDir, "Default"), "profile");
    const hung = spawnArgvMarker(
      `--user-data-dir=${userDataDir}`,
      "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000)",
    );

    try {
      await waitUntil(() => isPidAlive(hung.pid));
      const killed = await killChromeForUserDataDir(userDataDir, {
        exitTimeoutMs: 400,
      });
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
    }
  });

  it("leaves a real Chrome :9334 bystander, an unrelated lighthouse.* dir, and lighthouse-cw-OTHERRUN", async () => {
    const attemptDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
    const otherRunDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-OTHERRUN-"));
    const bystanderLhDir = mkdtempSync(join(tmpdir(), "lighthouse."));
    const debugProfile = mkdtempSync(join(tmpdir(), "cw-debug-"));
    writeFileSync(join(bystanderLhDir, "Keep"), "unrelated");

    const beforeLauncherDirs = listLauncherUserDataDirs();
    assert.equal(beforeLauncherDirs.has(bystanderLhDir), true);

    const target = spawnArgvMarker(`--user-data-dir=${attemptDir}`);
    const debugChrome = spawnChrome([
      "--remote-debugging-port=9334",
      `--user-data-dir=${debugProfile}`,
    ]);
    const lhBystander = spawnChrome([`--user-data-dir=${bystanderLhDir}`]);
    const otherRun = spawnChrome([`--user-data-dir=${otherRunDir}`]);

    try {
      await waitUntil(
        () =>
          isPidAlive(target.pid) &&
          isPidAlive(debugChrome.pid) &&
          isPidAlive(lhBystander.pid) &&
          isPidAlive(otherRun.pid),
      );

      const extraDirs = createdLauncherDirs(beforeLauncherDirs);
      assert.equal(extraDirs.includes(bystanderLhDir), false);

      const killed = await killChromeForUserDataDir(attemptDir, { extraDirs });
      assert.equal(killed.has(target.pid), true);
      assert.equal(killed.has(debugChrome.pid), false);
      assert.equal(killed.has(lhBystander.pid), false);
      assert.equal(killed.has(otherRun.pid), false);

      await waitUntil(() => !isPidAlive(target.pid));
      assert.equal(existsSync(attemptDir), false);
      assert.equal(isPidAlive(debugChrome.pid), true);
      assert.equal(isPidAlive(lhBystander.pid), true);
      assert.equal(existsSync(bystanderLhDir), true);
      assert.equal(isPidAlive(otherRun.pid), true);
      assert.equal(existsSync(otherRunDir), true);
      assert.equal(
        pidsForUserDataDir(
          [`${debugChrome.pid} chrome --remote-debugging-port=9334`],
          attemptDir,
        ).size,
        0,
      );
    } finally {
      for (const child of [target, debugChrome, lhBystander, otherRun]) {
        try {
          process.kill(child.pid, "SIGKILL");
        } catch {
          // already gone
        }
      }
      for (const dir of [attemptDir, otherRunDir, bystanderLhDir, debugProfile]) {
        try {
          rmSync(dir, { recursive: true, force: true });
        } catch {
          // already gone
        }
      }
    }
  });
});
