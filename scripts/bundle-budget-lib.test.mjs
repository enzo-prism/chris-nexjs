import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRouteLine } from "./bundle-budget-lib.mjs";

test("reads first-load size with or without ISR lifetime columns", () => {
  for (const line of [
    "┌ ○ /                         8.72 kB  184 kB",
    "┌ ○ /                         8.72 kB  184 kB  1d  1y",
  ]) {
    assert.deepEqual(parseRouteLine(line), { route: "/", firstLoadKb: 184 });
  }
  assert.deepEqual(parseRouteLine("├ ƒ /api/search  178 B  104 kB"), {
    route: "/api/search", firstLoadKb: 104,
  });
  assert.deepEqual(parseRouteLine("├ ● /blog/[slug]  2.29 kB  170 kB  1d  1y"), {
    route: "/blog/[slug]", firstLoadKb: 170,
  });
});

test("ignores headers, framework totals, and nested prerendered-path rows", () => {
  for (const line of [
    "Route (app) Size First Load JS Revalidate Expire",
    "+ First Load JS shared by all 103 kB",
    "├   ├ /blog/example 1d 1y",
  ]) {
    assert.equal(parseRouteLine(line), null);
  }
});
