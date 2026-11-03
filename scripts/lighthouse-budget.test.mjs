import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { killChromeForUserDataDir, pidsForUserDataDir } from "./lighthouse-chrome.mjs";

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function spawnArgvMarker(marker) {
  const child = spawn(
    process.execPath,
    ["-e", "setInterval(() => {}, 1000)", "--", marker],
    {
      detached: true,
      stdio: "ignore",
    },
  );
  child.unref();
  return child;
}

describe("lighthouse chrome cleanup", () => {
  it("kills only the process that carries this attempt's user-data-dir", async () => {
    const userDataDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-test-"));
    const target = spawnArgvMarker(`--user-data-dir=${userDataDir}`);
    const bystander = spawnArgvMarker("--remote-debugging-port=9222");

    try {
      assert.ok(target.pid);
      assert.ok(bystander.pid);
      assert.equal(isAlive(target.pid), true);
      assert.equal(isAlive(bystander.pid), true);

      const killed = killChromeForUserDataDir(userDataDir);
      assert.equal(killed.has(target.pid), true);
      assert.equal(killed.has(bystander.pid), false);

      const deadline = Date.now() + 1_000;
      while (isAlive(target.pid) && Date.now() < deadline) {
        await new Promise((resolve) => {
          setTimeout(resolve, 25);
        });
      }

      assert.equal(isAlive(target.pid), false);
      assert.equal(isAlive(bystander.pid), true);
      assert.equal(existsSync(userDataDir), false);
      assert.equal(
        pidsForUserDataDir(
          [`${bystander.pid} chrom --remote-debugging-port=9222`],
          userDataDir,
        ).size,
        0,
      );
    } finally {
      try {
        process.kill(bystander.pid, "SIGTERM");
      } catch {
        // already gone
      }
      try {
        process.kill(target.pid, "SIGTERM");
      } catch {
        // already gone
      }
    }
  });
});
