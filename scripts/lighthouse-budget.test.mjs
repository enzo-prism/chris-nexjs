import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("scripts/lighthouse-budget.mjs", "utf8");

assert.match(source, /function snapshotLaunchedChrome/);
assert.match(source, /function killLaunchedChrome\(snapshot\)/);
assert.match(source, /lighthouse\./);
assert.match(source, /finally \{\s*killLaunchedChrome\(snapshot\);/s);
assert.doesNotMatch(
  source,
  /if \(!\/--remote-debugging-port=\/\.test\(line\)\) continue/,
);
assert.equal(
  source.includes("killLaunchedChrome()"),
  false,
  "must not kill every Chrome with --remote-debugging-port",
);

console.log("lighthouse-budget kill scope checks passed");
