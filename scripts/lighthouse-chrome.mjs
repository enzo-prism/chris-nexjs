import { execSync } from "node:child_process";
import { readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const CHROME_EXIT_WAIT_MS = 2_000;
export const CHROME_EXIT_POLL_MS = 50;

export function listProcessLines() {
  try {
    return execSync("ps -eo pid=,args=", { encoding: "utf8" }).split("\n");
  } catch {
    return [];
  }
}

export function pidFromPsLine(line) {
  const pid = Number.parseInt(line.trim().split(/\s+/, 1)[0] ?? "", 10);
  if (!Number.isInteger(pid) || pid <= 1 || pid === process.pid) return null;
  return pid;
}

export function pidsForUserDataDir(psLines, userDataDir) {
  const pids = new Set();
  if (!userDataDir) return pids;
  for (const line of psLines) {
    if (!line.includes(userDataDir)) continue;
    const pid = pidFromPsLine(line);
    if (pid) pids.add(pid);
  }
  return pids;
}

export function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function listLauncherUserDataDirs() {
  const tmp = tmpdir();
  try {
    return new Set(
      readdirSync(tmp)
        .filter((name) => /^lighthouse\.[^/]+$/.test(name))
        .map((name) => join(tmp, name))
        .filter((absolutePath) => {
          try {
            return statSync(absolutePath).isDirectory();
          } catch {
            return false;
          }
        }),
    );
  } catch {
    return new Set();
  }
}

export function createdLauncherDirs(before) {
  return [...listLauncherUserDataDirs()].filter((dir) => !before.has(dir));
}

export function killPids(pids, killFn = (pid, signal) => process.kill(pid, signal), signal = "SIGTERM") {
  for (const pid of pids) {
    try {
      killFn(pid, signal);
    } catch {
      // Process already exited.
    }
  }
}

export async function waitForPidsToExit(pids, options = {}) {
  const timeoutMs = options.timeoutMs ?? CHROME_EXIT_WAIT_MS;
  const pollMs = options.pollMs ?? CHROME_EXIT_POLL_MS;
  const killFn = options.killFn ?? ((pid, signal) => process.kill(pid, signal));
  const alive = options.isAlive ?? isPidAlive;
  const remaining = new Set(pids);
  const deadline = Date.now() + timeoutMs;

  while (remaining.size > 0 && Date.now() < deadline) {
    for (const pid of [...remaining]) {
      if (!alive(pid)) remaining.delete(pid);
    }
    if (remaining.size === 0) break;
    await new Promise((resolve) => {
      setTimeout(resolve, pollMs);
    });
  }

  killPids(remaining, killFn, "SIGKILL");

  const killDeadline = Date.now() + timeoutMs;
  while (remaining.size > 0 && Date.now() < killDeadline) {
    for (const pid of [...remaining]) {
      if (!alive(pid)) remaining.delete(pid);
    }
    if (remaining.size === 0) break;
    await new Promise((resolve) => {
      setTimeout(resolve, pollMs);
    });
  }

  return remaining;
}

export async function killChromeForUserDataDir(userDataDir, options = {}) {
  const listLines = options.listLines ?? listProcessLines;
  const killFn = options.killFn ?? ((pid, signal) => process.kill(pid, signal));
  const extraDirs = options.extraDirs ?? [];
  const pids = pidsForUserDataDir(listLines(), userDataDir);

  killPids(pids, killFn, "SIGTERM");
  await waitForPidsToExit(pids, {
    killFn,
    isAlive: options.isAlive,
    timeoutMs: options.exitTimeoutMs,
  });

  const leftover = pidsForUserDataDir(listLines(), userDataDir);
  if (leftover.size) {
    killPids(leftover, killFn, "SIGKILL");
    await waitForPidsToExit(leftover, {
      killFn,
      isAlive: options.isAlive,
      timeoutMs: options.exitTimeoutMs,
    });
  }

  for (const dir of [userDataDir, ...extraDirs]) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // Temp profile already gone.
    }
  }

  return pids;
}
