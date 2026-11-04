import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createServer } from "node:net";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";

import { runLighthouseOnce } from "./lighthouse-budget.mjs";
import {
  isOwnedTempProfile,
  isPidAlive,
  killChromeForUserDataDir,
  pidsForUserDataDir,
  userDataDirsFromPsLines,
  waitForPidsToExit,
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

function chromiumScratchDirs() {
  return readdirSync(tmpdir())
    .filter((name) => name.startsWith("org.chromium."))
    .map((name) => join(tmpdir(), name));
}

function seven() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 7; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

const gnuMktempSkip =
  process.platform === "linux"
    ? false
    : "GNU mktemp -t lighthouse.XXXXXXX is Linux-only; BSD mktemp -t appends its own suffix";

function mkGnuLauncherDir() {
  // chrome-launcher 1.2.2 uses GNU `mktemp -d -t lighthouse.XXXXXXX` (7 chars).
  // Tests that call this are skipped on non-Linux (`gnuMktempSkip`).
  const dir = execFileSync("mktemp", ["-d", "-t", "lighthouse.XXXXXXX"], {
    encoding: "utf8",
  }).trim();
  if (!/^lighthouse\.[A-Za-z0-9]{7}$/.test(basename(dir))) {
    rmSync(dir, { recursive: true, force: true });
    throw new Error(`expected GNU lighthouse.XXXXXXX, got ${basename(dir)}`);
  }
  return dir;
}

async function reap(kids, dirs, scratchBefore = new Set()) {
  for (const child of kids) {
    if (!child?.pid) continue;
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      try {
        process.kill(child.pid, "SIGKILL");
      } catch {
        // already gone
      }
    }
  }
  const deadline = Date.now() + 2_000;
  while (Date.now() < deadline && kids.some((child) => child?.pid && isPidAlive(child.pid))) {
    await new Promise((resolve) => {
      setTimeout(resolve, 25);
    });
  }
  for (const dir of dirs) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // already gone
    }
  }
  for (const dir of chromiumScratchDirs()) {
    if (scratchBefore.has(dir)) continue;
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // already gone
    }
  }
}

function unrefResolve(ms, value) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(value), ms);
    timer.unref();
  });
}

function unrefReject(ms, message) {
  return new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    timer.unref();
  });
}

describe("lighthouse chrome cleanup", { concurrency: false }, () => {
  it("bounds waitForPidsToExit wait-phase elapsed time", { timeout: 3_000 }, async () => {
    const timeoutMs = 80;
    const slackMs = 150; // elapsed cap 310ms
    const raceMs = 2 * timeoutMs + 400; // 560ms
    let hold = true;
    const started = Date.now();
    const finished = waitForPidsToExit([99], {
      timeoutMs,
      pollMs: 10,
      isAlive: () => hold,
      killFn: () => {},
    });
    const timedOut = Symbol("timeout");
    const winner = await Promise.race([
      finished,
      unrefResolve(raceMs, timedOut),
    ]);
    const elapsed = Date.now() - started;
    hold = false;
    await Promise.race([
      finished,
      unrefResolve(100),
    ]);
    assert.notEqual(winner, timedOut, `wait exceeded race cap (${elapsed}ms)`);
    assert.ok(
      elapsed <= 2 * timeoutMs + slackMs,
      `elapsed ${elapsed}ms exceeded ${2 * timeoutMs + slackMs}ms`,
    );
    assert.ok(elapsed >= timeoutMs - 20, `elapsed ${elapsed}ms skipped the wait deadline`);
  });

  it("SIGKILLs leftovers after the first wait when the re-list is empty", { timeout: 3_000 }, async () => {
    const dirs = [];
    let hold = true;
    try {
      const userDataDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(userDataDir);
      writeFileSync(join(userDataDir, "Default"), "profile");
      const fakePid = 424201;
      const line = `${fakePid} chrome --user-data-dir=${userDataDir}`;
      const argv = ["chrome", `--user-data-dir=${userDataDir}`];
      const signals = [];
      let listed = 0;
      const exitTimeoutMs = 40;
      const slackMs = 150;
      const raceMs = 2 * exitTimeoutMs + 400;
      const started = Date.now();
      const finished = killChromeForUserDataDir(userDataDir, {
        exitTimeoutMs,
        isAlive: () => hold,
        listLines: () => {
          listed += 1;
          return listed === 1 ? [line] : [];
        },
        readArgv: () => argv,
        killFn: (_pid, signal) => {
          signals.push(signal);
        },
      });
      const timedOut = Symbol("timeout");
      const winner = await Promise.race([
        finished,
        unrefResolve(raceMs, timedOut),
      ]);
      const elapsed = Date.now() - started;
      hold = false;
      await Promise.race([
        finished,
        unrefResolve(100),
      ]);
      assert.notEqual(winner, timedOut, `cleanup exceeded race cap (${elapsed}ms)`);
      assert.ok(
        elapsed <= 2 * exitTimeoutMs + slackMs,
        `elapsed ${elapsed}ms exceeded ${2 * exitTimeoutMs + slackMs}ms`,
      );
      assert.ok(
        signals.includes("SIGKILL"),
        `first-wait SIGKILL missing; signals=${signals.join(",")}`,
      );
      assert.equal(existsSync(userDataDir), false);
    } finally {
      hold = false;
      await reap([], dirs);
    }
  });

  it("SIGKILLs leftover PIDs that appeared dead during the first wait", { timeout: 3_000 }, async () => {
    const dirs = [];
    let hold = true;
    try {
      const userDataDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(userDataDir);
      writeFileSync(join(userDataDir, "Default"), "profile");
      const fakePid = 424207;
      const line = `${fakePid} chrome --user-data-dir=${userDataDir}`;
      const argv = ["chrome", `--user-data-dir=${userDataDir}`];
      const signals = [];
      let termSeen = false;
      let leftoverListed = false;
      const timedOut = Symbol("timeout");
      const finished = killChromeForUserDataDir(userDataDir, {
        exitTimeoutMs: 40,
        isAlive: () => {
          if (!hold) return false;
          if (!termSeen) return true;
          if (!leftoverListed) return false;
          return true;
        },
        listLines: () => {
          if (termSeen) leftoverListed = true;
          return [line];
        },
        readArgv: () => argv,
        killFn: (_pid, signal) => {
          signals.push(signal);
          if (signal === "SIGTERM") termSeen = true;
        },
      });
      const winner = await Promise.race([
        finished,
        unrefResolve(1_000, timedOut),
      ]);
      assert.notEqual(winner, timedOut, "leftover-wait cleanup exceeded 1s race");
      assert.ok(
        signals.includes("SIGKILL"),
        `leftover SIGKILL missing; signals=${signals.join(",")}`,
      );
      assert.equal(existsSync(userDataDir), false);
    } finally {
      hold = false;
      await reap([], dirs);
    }
  });

  it("waits for a ready SIGTERM-ignorer that rewrites its profile, then SIGKILLs and removes the dir", { timeout: 8_000 }, async () => {
    const kids = [];
    const dirs = [];
    try {
      const userDataDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(userDataDir);
      const readyFile = join(userDataDir, "ready");
      writeFileSync(join(userDataDir, "Default"), "profile");
      const hung = spawnArgvMarker(
        `--user-data-dir=${userDataDir}`,
        termIgnorerScript(userDataDir, readyFile),
      );
      kids.push(hung);

      await waitUntil(() => existsSync(readyFile));
      assert.equal(isPidAlive(hung.pid), true);
      const started = Date.now();
      const killed = await Promise.race([
        killChromeForUserDataDir(userDataDir, {
          exitTimeoutMs: 400,
        }),
        unrefReject(3_000, "cleanup exceeded 3s race"),
      ]);
      assert.ok(
        Date.now() - started >= 300,
        "cleanup must wait out SIGTERM before SIGKILL",
      );
      assert.equal(killed.has(hung.pid), true);
      await waitUntil(() => !isPidAlive(hung.pid), 2_000);
      assert.equal(isPidAlive(hung.pid), false);
      assert.equal(existsSync(userDataDir), false);
    } finally {
      await reap(kids, dirs);
    }
  });

  it("removes this run's argv launcher dir and leaves a during-attempt lighthouse.* Chrome", { skip: gnuMktempSkip }, async () => {
    const kids = [];
    const dirs = [];
    const scratchBefore = new Set(chromiumScratchDirs());
    try {
      const attemptDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(attemptDir);
      const thisRunLauncher = mkGnuLauncherDir();
      dirs.push(thisRunLauncher);
      const sixCharSameProcess = mkdtempSync(join(tmpdir(), "lighthouse."));
      dirs.push(sixCharSameProcess);
      const otherRunDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(otherRunDir);
      const preexistingLhDir = mkGnuLauncherDir();
      dirs.push(preexistingLhDir);
      const debugProfile = mkdtempSync(join(tmpdir(), "cw-debug-"));
      dirs.push(debugProfile);
      writeFileSync(join(preexistingLhDir, "Keep"), "unrelated");
      writeFileSync(join(thisRunLauncher, "Launcher"), "this-run");
      writeFileSync(join(sixCharSameProcess, "Keep"), "six");
      assert.match(basename(thisRunLauncher), /^lighthouse\.[A-Za-z0-9]{7}$/);
      assert.match(basename(sixCharSameProcess), /^lighthouse\.[A-Za-z0-9]{6}$/);

      const debugPort = await unusedPort();
      kids.push(
        spawnArgvMarker([
          `--user-data-dir=${attemptDir}`,
          `--user-data-dir=${thisRunLauncher}`,
          `--user-data-dir=${sixCharSameProcess}`,
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

      const duringLhDir = mkGnuLauncherDir();
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
      assert.equal(existsSync(join(sixCharSameProcess, "Keep")), true);
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
      await reap(kids, dirs, scratchBefore);
    }
  });

  it("removes the profile when a Lighthouse launch throws", async () => {
    const dirs = [];
    try {
      const userDataDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(userDataDir);
      writeFileSync(join(userDataDir, "Default"), "profile");
      await assert.rejects(
        () =>
          runLighthouseOnce("http://127.0.0.1:9/nope", {
            userDataDir,
            execSync: () => {
              throw new Error("waiting for dynamic debugging port");
            },
          }),
        /waiting for dynamic debugging port/,
      );
      assert.equal(existsSync(userDataDir), false);
    } finally {
      await reap([], dirs);
    }
  });

  it("bounds wait time and still removes the dir when pids appear stuck", { timeout: 3_000 }, async () => {
    const dirs = [];
    let hold = true;
    try {
      const userDataDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(userDataDir);
      writeFileSync(join(userDataDir, "Default"), "profile");
      const fakePid = 424242;
      const line = `${fakePid} chrome --user-data-dir=${userDataDir}`;
      const argv = ["chrome", `--user-data-dir=${userDataDir}`];
      const exitTimeoutMs = 80;
      const boundMs = 4 * exitTimeoutMs + 500;
      const started = Date.now();
      const finished = killChromeForUserDataDir(userDataDir, {
        exitTimeoutMs,
        isAlive: () => hold,
        listLines: () => [line],
        readArgv: () => argv,
        killFn: () => {},
      });
      const timedOut = Symbol("timeout");
      const winner = await Promise.race([
        finished,
        unrefResolve(boundMs, timedOut),
      ]);
      const elapsed = Date.now() - started;
      hold = false;
      await Promise.race([
        finished,
        unrefResolve(100),
      ]);
      assert.notEqual(winner, timedOut, `cleanup exceeded bound (${elapsed}ms)`);
      assert.ok(elapsed <= boundMs, `elapsed ${elapsed}ms exceeded ${boundMs}ms`);
      assert.equal(existsSync(userDataDir), false);
    } finally {
      hold = false;
      await reap([], dirs);
    }
  });

  it("does not delete a truncated parent when TMPDIR contains a space", { timeout: 8_000, skip: gnuMktempSkip }, async () => {
    const dirs = [];
    try {
      const sandbox = mkdtempSync(join(tmpdir(), "cw-space-sandbox-"));
      dirs.push(sandbox);
      const spacedTmp = join(sandbox, "my tmp");
      mkdirSync(spacedTmp, { recursive: true });
      const truncated = join(sandbox, "my");
      mkdirSync(truncated);
      writeFileSync(join(truncated, "Keep"), "parent");

      const helper = join(sandbox, "space-tmpdir.mjs");
      writeFileSync(
        helper,
        `
          import { execFileSync } from "node:child_process";
          import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
          import { join } from "node:path";
          import { killChromeForUserDataDir } from ${JSON.stringify(
            pathToFileURL(join(process.cwd(), "scripts/lighthouse-chrome.mjs")).href,
          )};
          const attemptDir = mkdtempSync(join(process.env.TMPDIR, "lighthouse-cw-"));
          writeFileSync(join(attemptDir, "Default"), "x");
          const launcher = execFileSync("mktemp", ["-d", "-t", "lighthouse.XXXXXXX"], {
            encoding: "utf8",
          }).trim();
          await killChromeForUserDataDir(attemptDir, {
            listLines: () => [
              "4242 chrome --user-data-dir=" + launcher + " --user-data-dir=" + attemptDir,
            ],
            readArgv: () => [
              "chrome",
              "--user-data-dir=" + launcher,
              "--user-data-dir=" + attemptDir,
            ],
            killFn: () => {},
            isAlive: () => false,
            exitTimeoutMs: 20,
          });
          process.stdout.write(JSON.stringify({
            keep: existsSync(${JSON.stringify(join(truncated, "Keep"))}),
            attemptGone: !existsSync(attemptDir),
            launcherGone: !existsSync(launcher),
          }));
        `,
      );

      const child = spawn(process.execPath, [helper], {
        env: { ...process.env, TMPDIR: spacedTmp },
        encoding: "utf8",
      });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (chunk) => {
        stdout += chunk;
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
      });
      const exitCode = await new Promise((resolve, reject) => {
        child.on("error", reject);
        child.on("close", resolve);
      });
      assert.equal(exitCode, 0, stderr);
      const report = JSON.parse(stdout);
      assert.equal(report.keep, true);
      assert.equal(report.attemptGone, true);
      assert.equal(report.launcherGone, true);
      assert.equal(existsSync(join(truncated, "Keep")), true);
    } finally {
      await reap([], dirs);
    }
  });

  it("does not delete a user-data-dir outside os.tmpdir()", async () => {
    const dirs = [];
    try {
      const sandbox = mkdtempSync(join(tmpdir(), "cw-outside-sandbox-"));
      dirs.push(sandbox);
      const outside = mkdtempSync(join(sandbox, "not-tmp-victim-"));
      dirs.push(outside);
      writeFileSync(join(outside, "Keep"), "outside");
      const attemptDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(attemptDir);
      writeFileSync(join(attemptDir, "Default"), "profile");
      await killChromeForUserDataDir(attemptDir, {
        listLines: () => [
          `4243 chrome --user-data-dir=${outside} --user-data-dir=${attemptDir}`,
        ],
        readArgv: () => [
          "chrome",
          `--user-data-dir=${outside}`,
          `--user-data-dir=${attemptDir}`,
        ],
        killFn: () => {},
        isAlive: () => false,
        exitTimeoutMs: 20,
      });
      assert.equal(existsSync(join(outside, "Keep")), true);
      assert.equal(isOwnedTempProfile(outside), false);
      assert.equal(existsSync(attemptDir), false);
    } finally {
      await reap([], dirs);
    }
  });

  it("does not delete a relative user-data-dir", async () => {
    const dirs = [];
    const prev = process.cwd();
    try {
      const relCwd = mkdtempSync(join(tmpdir(), "cw-rel-cwd-"));
      dirs.push(relCwd);
      const relVictim = join(relCwd, "relprof");
      mkdirSync(relVictim);
      writeFileSync(join(relVictim, "Keep"), "rel");
      const attemptDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(attemptDir);
      process.chdir(relCwd);
      await killChromeForUserDataDir(attemptDir, {
        listLines: () => [
          `4244 chrome --user-data-dir=relprof --user-data-dir=${attemptDir}`,
        ],
        readArgv: () => ["chrome", "--user-data-dir=relprof", `--user-data-dir=${attemptDir}`],
        killFn: () => {},
        isAlive: () => false,
        exitTimeoutMs: 20,
      });
      assert.equal(existsSync(join(relVictim, "Keep")), true);
      assert.equal(isOwnedTempProfile("relprof"), false);
      assert.equal(existsSync(attemptDir), false);
    } finally {
      process.chdir(prev);
      await reap([], dirs);
    }
  });

  it("does not delete through a .. user-data-dir", async () => {
    const dirs = [];
    const prev = process.cwd();
    try {
      const parent = mkdtempSync(join(tmpdir(), "cw-dotdot-"));
      dirs.push(parent);
      writeFileSync(join(parent, "Keep"), "sibling");
      const child = join(parent, "child");
      mkdirSync(child);
      const attemptDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(attemptDir);
      process.chdir(child);
      await killChromeForUserDataDir(attemptDir, {
        listLines: () => [`4245 chrome --user-data-dir=.. --user-data-dir=${attemptDir}`],
        readArgv: () => ["chrome", "--user-data-dir=..", `--user-data-dir=${attemptDir}`],
        killFn: () => {},
        isAlive: () => false,
        exitTimeoutMs: 20,
      });
      assert.equal(existsSync(join(parent, "Keep")), true);
      assert.equal(isOwnedTempProfile(".."), false);
      assert.equal(existsSync(attemptDir), false);
    } finally {
      process.chdir(prev);
      await reap([], dirs);
    }
  });

  it("does not follow a user-data-dir symlink", async () => {
    const dirs = [];
    let link;
    try {
      const target = mkdtempSync(join(tmpdir(), "cw-symlink-target-"));
      dirs.push(target);
      writeFileSync(join(target, "Keep"), "target");
      link = join(tmpdir(), `lighthouse.${seven()}`);
      symlinkSync(target, link);
      dirs.push(link);
      const attemptDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(attemptDir);
      await killChromeForUserDataDir(attemptDir, {
        listLines: () => [
          `4246 chrome --user-data-dir=${link}/ --user-data-dir=${attemptDir}`,
        ],
        readArgv: () => [
          "chrome",
          `--user-data-dir=${link}/`,
          `--user-data-dir=${attemptDir}`,
        ],
        killFn: () => {},
        isAlive: () => false,
        exitTimeoutMs: 20,
      });
      assert.equal(existsSync(join(target, "Keep")), true);
      assert.equal(existsSync(link), true);
      assert.equal(lstatSync(link).isSymbolicLink(), true);
      assert.equal(isOwnedTempProfile(link), false);
      assert.equal(existsSync(attemptDir), false);
    } finally {
      await reap([], dirs);
    }
  });

  it("does not treat --headless as a user-data-dir value", async () => {
    const dirs = [];
    const prev = process.cwd();
    try {
      const flagCwd = mkdtempSync(join(tmpdir(), "cw-flag-cwd-"));
      dirs.push(flagCwd);
      const headlessVictim = join(flagCwd, "--headless");
      mkdirSync(headlessVictim);
      writeFileSync(join(headlessVictim, "Keep"), "flag");
      const attemptDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(attemptDir);
      process.chdir(flagCwd);
      await killChromeForUserDataDir(attemptDir, {
        listLines: () => [
          `4247 chrome --user-data-dir --headless --user-data-dir=${attemptDir}`,
        ],
        readArgv: () => [
          "chrome",
          "--user-data-dir",
          "--headless",
          `--user-data-dir=${attemptDir}`,
        ],
        killFn: () => {},
        isAlive: () => false,
        exitTimeoutMs: 20,
      });
      assert.equal(existsSync(join(headlessVictim, "Keep")), true);
      assert.equal(isOwnedTempProfile("--headless"), false);
      assert.equal(existsSync(attemptDir), false);
    } finally {
      process.chdir(prev);
      await reap([], dirs);
    }
  });

  it("does not SIGKILL a process that only mentions the attempt path", async () => {
    const kids = [];
    const dirs = [];
    try {
      const attemptDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(attemptDir);
      writeFileSync(join(attemptDir, "Default"), "profile");
      const mentionDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(mentionDir);
      writeFileSync(join(mentionDir, "Keep"), "mention");
      const mention = spawnArgvMarker([
        `--log=${attemptDir}/chrome-err.log`,
        `--user-data-dir=${mentionDir}`,
      ]);
      kids.push(mention);
      await waitUntil(() => isPidAlive(mention.pid));
      assert.equal(
        pidsForUserDataDir(
          [
            `${mention.pid} node --log=${attemptDir}/chrome-err.log --user-data-dir=${mentionDir}`,
          ],
          attemptDir,
        ).size,
        0,
      );
      const signals = [];
      const killed = await killChromeForUserDataDir(attemptDir, {
        killFn: (pid, signal) => {
          signals.push({ pid, signal });
          try {
            process.kill(pid, signal);
          } catch {
            // already gone
          }
        },
      });
      assert.equal(killed.has(mention.pid), false);
      assert.equal(
        signals.some((entry) => entry.pid === mention.pid),
        false,
      );
      assert.equal(isPidAlive(mention.pid), true);
      assert.equal(existsSync(join(mentionDir, "Keep")), true);
      assert.equal(existsSync(attemptDir), false);
    } finally {
      await reap(kids, dirs);
    }
  });

  it("rejects a relative lighthouse.ABCDEFG when cwd is tmpdir", async () => {
    const dirs = [];
    const prev = process.cwd();
    const relativeName = "lighthouse.ABCDEFG";
    const victim = join(tmpdir(), relativeName);
    try {
      rmSync(victim, { recursive: true, force: true });
      mkdirSync(victim);
      dirs.push(victim);
      writeFileSync(join(victim, "Keep"), "relative");
      const attemptDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(attemptDir);
      process.chdir(tmpdir());
      await killChromeForUserDataDir(attemptDir, {
        listLines: () => [
          `4251 chrome --user-data-dir=${relativeName} --user-data-dir=${attemptDir}`,
        ],
        readArgv: () => [
          "chrome",
          `--user-data-dir=${relativeName}`,
          `--user-data-dir=${attemptDir}`,
        ],
        killFn: () => {},
        isAlive: () => false,
        exitTimeoutMs: 20,
      });
      assert.equal(isOwnedTempProfile(relativeName), false);
      assert.equal(existsSync(join(victim, "Keep")), true);
      assert.equal(existsSync(attemptDir), false);
    } finally {
      process.chdir(prev);
      await reap([], dirs);
    }
  });

  it("does not delete lighthouse.ABCDEFG outside tmpdir", async () => {
    const dirs = [];
    try {
      const sandbox = mkdtempSync(join(tmpdir(), "cw-g3-sandbox-"));
      dirs.push(sandbox);
      const victim = join(sandbox, "lighthouse.ABCDEFG");
      mkdirSync(victim);
      dirs.push(victim);
      writeFileSync(join(victim, "Keep"), "outside");
      const attemptDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(attemptDir);
      await killChromeForUserDataDir(attemptDir, {
        listLines: () => [
          `4253 chrome --user-data-dir=${victim} --user-data-dir=${attemptDir}`,
        ],
        readArgv: () => [
          "chrome",
          `--user-data-dir=${victim}`,
          `--user-data-dir=${attemptDir}`,
        ],
        killFn: () => {},
        isAlive: () => false,
        extraDirs: [victim],
        exitTimeoutMs: 20,
      });
      assert.equal(isOwnedTempProfile(victim), false);
      assert.equal(existsSync(join(victim, "Keep")), true);
      assert.equal(existsSync(attemptDir), false);
    } finally {
      await reap([], dirs);
    }
  });

  it("does not delete xlighthouse.ABCDEFG inside tmpdir", async () => {
    const dirs = [];
    const victim = join(tmpdir(), "xlighthouse.ABCDEFG");
    try {
      rmSync(victim, { recursive: true, force: true });
      mkdirSync(victim);
      dirs.push(victim);
      writeFileSync(join(victim, "Keep"), "prefix");
      const attemptDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(attemptDir);
      await killChromeForUserDataDir(attemptDir, {
        listLines: () => [
          `4255 chrome --user-data-dir=${victim} --user-data-dir=${attemptDir}`,
        ],
        readArgv: () => [
          "chrome",
          `--user-data-dir=${victim}`,
          `--user-data-dir=${attemptDir}`,
        ],
        killFn: () => {},
        isAlive: () => false,
        extraDirs: [victim],
        exitTimeoutMs: 20,
      });
      assert.equal(isOwnedTempProfile(victim), false);
      assert.equal(existsSync(join(victim, "Keep")), true);
      assert.equal(existsSync(attemptDir), false);
    } finally {
      await reap([], dirs);
    }
  });

  it("does not delete lighthouse.ABCDEFG-x inside tmpdir", async () => {
    const dirs = [];
    const victim = join(tmpdir(), "lighthouse.ABCDEFG-x");
    try {
      rmSync(victim, { recursive: true, force: true });
      mkdirSync(victim);
      dirs.push(victim);
      writeFileSync(join(victim, "Keep"), "suffix");
      const attemptDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(attemptDir);
      await killChromeForUserDataDir(attemptDir, {
        listLines: () => [
          `4256 chrome --user-data-dir=${victim} --user-data-dir=${attemptDir}`,
        ],
        readArgv: () => [
          "chrome",
          `--user-data-dir=${victim}`,
          `--user-data-dir=${attemptDir}`,
        ],
        killFn: () => {},
        isAlive: () => false,
        extraDirs: [victim],
        exitTimeoutMs: 20,
      });
      assert.equal(isOwnedTempProfile(victim), false);
      assert.equal(existsSync(join(victim, "Keep")), true);
      assert.equal(existsSync(attemptDir), false);
    } finally {
      await reap([], dirs);
    }
  });

  it("does not delete cw-keep-ABCDEF inside tmpdir", async () => {
    const dirs = [];
    const victim = join(tmpdir(), "cw-keep-ABCDEF");
    try {
      rmSync(victim, { recursive: true, force: true });
      mkdirSync(victim);
      dirs.push(victim);
      writeFileSync(join(victim, "Keep"), "basename");
      const attemptDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(attemptDir);
      await killChromeForUserDataDir(attemptDir, {
        listLines: () => [
          `4254 chrome --user-data-dir=${victim} --user-data-dir=${attemptDir}`,
        ],
        readArgv: () => [
          "chrome",
          `--user-data-dir=${victim}`,
          `--user-data-dir=${attemptDir}`,
        ],
        killFn: () => {},
        isAlive: () => false,
        extraDirs: [victim],
        exitTimeoutMs: 20,
      });
      assert.equal(isOwnedTempProfile(victim), false);
      assert.equal(existsSync(join(victim, "Keep")), true);
      assert.equal(existsSync(attemptDir), false);
    } finally {
      await reap([], dirs);
    }
  });

  it("does not rm a non-owned userDataDir", async () => {
    const dirs = [];
    try {
      const victim = mkdtempSync(join(tmpdir(), "cw-not-owned-"));
      dirs.push(victim);
      writeFileSync(join(victim, "Keep"), "userdir");
      await killChromeForUserDataDir(victim, {
        listLines: () => [],
        killFn: () => {},
        isAlive: () => false,
        exitTimeoutMs: 20,
      });
      assert.equal(isOwnedTempProfile(victim), false);
      assert.equal(existsSync(join(victim, "Keep")), true);
    } finally {
      await reap([], dirs);
    }
  });

  it("rejects a regular file with a matching launcher name", async () => {
    const file = join(tmpdir(), `lighthouse.${seven()}`);
    try {
      writeFileSync(file, "not-a-dir");
      assert.equal(isOwnedTempProfile(file), false);
    } finally {
      try {
        rmSync(file, { force: true });
      } catch {
        // already gone
      }
    }
  });

  it("kills a token-less child in the matched process group", { timeout: 8_000 }, async () => {
    const kids = [];
    const dirs = [];
    try {
      const work = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(work);
      writeFileSync(join(work, "Default"), "profile");
      const childReady = join(work, "child-ready");
      const leaderReady = join(work, "leader-ready");
      const childPidFile = join(work, "child-pid");
      const childScript = join(work, "child.cjs");
      const leaderScript = join(work, "leader.cjs");
      writeFileSync(
        childScript,
        `
          const fs = require("node:fs");
          fs.writeFileSync(process.env.CHILD_READY, "ready");
          setInterval(() => {}, 1000);
        `,
      );
      writeFileSync(
        leaderScript,
        `
          const { spawn } = require("node:child_process");
          const fs = require("node:fs");
          const child = spawn(process.execPath, [process.env.CHILD_SCRIPT], {
            stdio: "ignore",
            env: process.env,
          });
          fs.writeFileSync(process.env.CHILD_PID_FILE, String(child.pid));
          fs.writeFileSync(process.env.LEADER_READY, "ready");
          setInterval(() => {}, 1000);
        `,
      );
      const leader = spawn(
        process.execPath,
        [leaderScript, "--", `--user-data-dir=${work}`],
        {
          detached: true,
          stdio: "ignore",
          env: {
            ...process.env,
            CHILD_SCRIPT: childScript,
            CHILD_READY: childReady,
            CHILD_PID_FILE: childPidFile,
            LEADER_READY: leaderReady,
          },
        },
      );
      leader.unref();
      kids.push(leader);
      await waitUntil(() => existsSync(leaderReady) && existsSync(childPidFile));
      const childPid = Number.parseInt(readFileSync(childPidFile, "utf8"), 10);
      await waitUntil(() => existsSync(childReady) && isPidAlive(childPid));
      const killed = await killChromeForUserDataDir(work, { exitTimeoutMs: 400 });
      assert.equal(killed.has(leader.pid), true);
      await waitUntil(() => !isPidAlive(leader.pid) && !isPidAlive(childPid), 2_000);
      assert.equal(isPidAlive(childPid), false);
      assert.equal(existsSync(work), false);
    } finally {
      await reap(kids, dirs);
    }
  });

  it("falls back to the PID when the match is not a group leader", { timeout: 8_000 }, async () => {
    const kids = [];
    const dirs = [];
    try {
      const work = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
      dirs.push(work);
      writeFileSync(join(work, "Default"), "profile");
      const childReady = join(work, "child-ready");
      const leaderReady = join(work, "leader-ready");
      const childPidFile = join(work, "child-pid");
      const childScript = join(work, "child.cjs");
      const leaderScript = join(work, "leader.cjs");
      writeFileSync(
        childScript,
        `
          const fs = require("node:fs");
          fs.writeFileSync(process.env.CHILD_READY, "ready");
          setInterval(() => {}, 1000);
        `,
      );
      writeFileSync(
        leaderScript,
        `
          const { spawn } = require("node:child_process");
          const fs = require("node:fs");
          const child = spawn(process.execPath, [process.env.CHILD_SCRIPT, "--", process.env.CHILD_TOKEN], {
            stdio: "ignore",
            env: process.env,
          });
          fs.writeFileSync(process.env.CHILD_PID_FILE, String(child.pid));
          fs.writeFileSync(process.env.LEADER_READY, "ready");
          setInterval(() => {}, 1000);
        `,
      );
      const leader = spawn(process.execPath, [leaderScript], {
        detached: true,
        stdio: "ignore",
        env: {
          ...process.env,
          CHILD_SCRIPT: childScript,
          CHILD_TOKEN: `--user-data-dir=${work}`,
          CHILD_READY: childReady,
          CHILD_PID_FILE: childPidFile,
          LEADER_READY: leaderReady,
        },
      });
      leader.unref();
      kids.push(leader);
      await waitUntil(() => existsSync(leaderReady) && existsSync(childPidFile));
      const childPid = Number.parseInt(readFileSync(childPidFile, "utf8"), 10);
      kids.push({ pid: childPid });
      await waitUntil(() => existsSync(childReady) && isPidAlive(childPid));
      const killed = await killChromeForUserDataDir(work, { exitTimeoutMs: 400 });
      assert.equal(killed.has(childPid), true);
      assert.equal(killed.has(leader.pid), false);
      await waitUntil(() => !isPidAlive(childPid), 2_000);
      assert.equal(isPidAlive(childPid), false);
      assert.equal(isPidAlive(leader.pid), true);
      assert.equal(existsSync(work), false);
    } finally {
      await reap(kids, dirs);
    }
  });

  it("parses only equals-form --user-data-dir tokens from /proc argv", () => {
    const src = readFileSync("scripts/lighthouse-chrome.mjs", "utf8");
    assert.doesNotMatch(src, /user-data-dir\(\?:=\|\\s\+\)/);
    assert.doesNotMatch(src, /line\.includes\(userDataDir\)/);
    assert.match(src, /\/proc\/\$\{pid\}\/cmdline/);
    assert.match(src, /isOwnedTempProfile/);
    assert.match(src, /lighthouse\\\.\[A-Za-z0-9\]\{7\}/);
    assert.doesNotMatch(src, /lighthouse\(\?:\\\.\|-cw-\)\[A-Za-z0-9\]\{6/);
    assert.doesNotMatch(src, /\[A-Za-z0-9\]\{6,7\}/);
    assert.match(src, /isDirectory\(\)/);
    assert.match(
      readFileSync("scripts/lighthouse-budget.mjs", "utf8"),
      /await cleanup\(userDataDir\)/,
    );
  });
});
