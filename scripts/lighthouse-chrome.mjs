import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

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

export function killPids(pids, killFn = (pid, signal) => process.kill(pid, signal)) {
  for (const pid of pids) {
    try {
      killFn(pid, "SIGTERM");
    } catch {
      // Process already exited.
    }
  }
}

export function killChromeForUserDataDir(userDataDir, options = {}) {
  const listLines = options.listLines ?? listProcessLines;
  const killFn = options.killFn ?? ((pid, signal) => process.kill(pid, signal));
  const pids = pidsForUserDataDir(listLines(), userDataDir);
  killPids(pids, killFn);
  try {
    rmSync(userDataDir, { recursive: true, force: true });
  } catch {
    // Temp profile already gone.
  }
  return pids;
}
