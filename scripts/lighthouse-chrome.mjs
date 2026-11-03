import { execSync } from "node:child_process";
import { lstatSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute } from "node:path";

export const CHROME_EXIT_WAIT_MS = 2_000;
export const CHROME_EXIT_POLL_MS = 50;

const USER_DATA_DIR_PREFIX = "--user-data-dir=";
const LAUNCHER_DIR_NAME =
  /^(?:lighthouse\.[A-Za-z0-9]{7}|lighthouse-cw-[A-Za-z0-9]{6})$/;

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

export function argvFor(pid, line) {
  try {
    return readFileSync(`/proc/${pid}/cmdline`, "utf8").split("\0").filter(Boolean);
  } catch {
    return line.trim().split(/\s+/).slice(1);
  }
}

export function isOwnedTempProfile(dir) {
  if (!dir || !isAbsolute(dir)) return false;
  try {
    const stat = lstatSync(dir);
    if (stat.isSymbolicLink() || !stat.isDirectory()) return false;
    return (
      realpathSync(dirname(dir)) === realpathSync(tmpdir()) &&
      LAUNCHER_DIR_NAME.test(basename(dir))
    );
  } catch {
    return false;
  }
}

export function pidsForUserDataDir(psLines, userDataDir, readArgv = argvFor) {
  const pids = new Set();
  if (!userDataDir) return pids;
  const token = `${USER_DATA_DIR_PREFIX}${userDataDir}`;
  for (const line of psLines) {
    const pid = pidFromPsLine(line);
    if (!pid) continue;
    if (readArgv(pid, line).includes(token)) pids.add(pid);
  }
  return pids;
}

export function userDataDirsFromPsLines(psLines, pids, readArgv = argvFor) {
  const dirs = new Set();
  if (!pids?.size) return dirs;
  for (const line of psLines) {
    const pid = pidFromPsLine(line);
    if (!pid || !pids.has(pid)) continue;
    for (const arg of readArgv(pid, line)) {
      if (!arg.startsWith(USER_DATA_DIR_PREFIX)) continue;
      const dir = arg.slice(USER_DATA_DIR_PREFIX.length).replace(/\/+$/, "");
      if (dir && isOwnedTempProfile(dir)) dirs.add(dir);
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

export function killProcess(pid, signal) {
  try {
    process.kill(-pid, signal);
    return;
  } catch {
    // Not a group leader, or already gone.
  }
  process.kill(pid, signal);
}

export function killPids(pids, killFn = killProcess, signal = "SIGTERM") {
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
  const killFn = options.killFn ?? killProcess;
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

function removeOwnedProfiles(dirs) {
  for (const dir of dirs) {
    if (!isOwnedTempProfile(dir)) continue;
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // Temp profile already gone.
    }
  }
}

export async function killChromeForUserDataDir(userDataDir, options = {}) {
  const listLines = options.listLines ?? listProcessLines;
  const readArgv = options.readArgv ?? argvFor;
  const killFn = options.killFn ?? killProcess;
  const extraDirs = options.extraDirs ?? [];
  const lines = listLines();
  const pids = pidsForUserDataDir(lines, userDataDir, readArgv);
  const argvDirs = userDataDirsFromPsLines(lines, pids, readArgv);

  killPids(pids, killFn, "SIGTERM");
  await waitForPidsToExit(pids, {
    killFn,
    isAlive: options.isAlive,
    timeoutMs: options.exitTimeoutMs,
  });

  const leftover = pidsForUserDataDir(listLines(), userDataDir, readArgv);
  if (leftover.size) {
    killPids(leftover, killFn, "SIGKILL");
    await waitForPidsToExit(leftover, {
      killFn,
      isAlive: options.isAlive,
      timeoutMs: options.exitTimeoutMs,
    });
  }

  // Bounded waits can still leave a PID; owned-profile rmSync still runs.
  removeOwnedProfiles(new Set([userDataDir, ...argvDirs, ...extraDirs]));

  return pids;
}
