import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

export const CHROME_EXIT_WAIT_MS = 2_000;
export const CHROME_EXIT_POLL_MS = 50;

const USER_DATA_DIR_FLAG = /--user-data-dir(?:=|\s+)(\S+)/g;

export function listProcessLines() {
  try {
    return execSync("ps -ww -eo pid=,args=", { encoding: "utf8" }).split("\n");
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

export function userDataDirsFromPsLines(psLines, pids) {
  const dirs = new Set();
  if (!pids?.size) return dirs;
  for (const line of psLines) {
    const pid = pidFromPsLine(line);
    if (!pid || !pids.has(pid)) continue;
    for (const match of line.matchAll(USER_DATA_DIR_FLAG)) {
      if (match[1]) dirs.add(match[1]);
    }
  }
  return dirs;
}

export function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
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
  const lines = listLines();
  const pids = pidsForUserDataDir(lines, userDataDir);
  const argvDirs = userDataDirsFromPsLines(lines, pids);

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

  // Bounded waits can still leave a PID; rmSync still runs.
  for (const dir of new Set([userDataDir, ...argvDirs, ...extraDirs])) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // Temp profile already gone.
    }
  }

  return pids;
}
