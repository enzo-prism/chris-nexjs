// Source-guard mutants only. Each trick edits PrivacyPolicy.tsx and runs
// scripts/sms-copy.test.ts. This script does not build the app or run the
// Playwright visibility spec.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const privacyPath = "client/src/pages/PrivacyPolicy.tsx";
const original = readFileSync(privacyPath, "utf8");
const ANCHOR = "<p>\n          {SMS_PRIVACY_NO_MARKETING_SHARE}";

const SOURCE_TRICKS = [
  ["truncate", '<p className="truncate">\n          {SMS_PRIVACY_NO_MARKETING_SHARE}'],
  ["line-clamp-1", '<p className="line-clamp-1">\n          {SMS_PRIVACY_NO_MARKETING_SHARE}'],
  ["max-h-6", '<p className="max-h-6 overflow-hidden">\n          {SMS_PRIVACY_NO_MARKETING_SHARE}'],
  ["filter-opacity", '<p className="[filter:opacity(0)]">\n          {SMS_PRIVACY_NO_MARKETING_SHARE}'],
  ["blur-xl", '<p className="blur-xl">\n          {SMS_PRIVACY_NO_MARKETING_SHARE}'],
  ["after-overlay", '<p className="relative after:absolute after:inset-0 after:bg-white">\n          {SMS_PRIVACY_NO_MARKETING_SHARE}'],
  ["oklch-0", '<p className="text-[oklch(0.2_0.05_140/0)]">\n          {SMS_PRIVACY_NO_MARKETING_SHARE}'],
  ["text-fill", '<p className="[-webkit-text-fill-color:transparent]">\n          {SMS_PRIVACY_NO_MARKETING_SHARE}'],
  ["mask-image", '<p className="[mask-image:linear-gradient(transparent,transparent)]">\n          {SMS_PRIVACY_NO_MARKETING_SHARE}'],
  ["font-0-5px", '<p className="text-[0.5px]">\n          {SMS_PRIVACY_NO_MARKETING_SHARE}'],
];

function restore() {
  writeFileSync(privacyPath, original);
}

function runCopy() {
  try {
    execFileSync("pnpm", ["exec", "tsx", "scripts/sms-copy.test.ts"], { encoding: "utf8" });
    return { ok: true, output: "" };
  } catch (error) {
    return { ok: false, output: `${error.stdout ?? ""}${error.stderr ?? ""}` };
  }
}

if (!original.includes(ANCHOR)) {
  console.log("ANCHOR_MISSING");
  process.exit(1);
}

restore();
const control = runCopy();
console.log(`SOURCE_CONTROL ok=${control.ok}`);
if (!control.ok) {
  console.log(control.output);
  process.exit(1);
}

let unexpected = 0;
for (const [id, replacement] of SOURCE_TRICKS) {
  restore();
  writeFileSync(privacyPath, original.replace(ANCHOR, replacement));
  const result = runCopy();
  const ok = result.ok === false;
  if (!ok) unexpected += 1;
  const hit = result.output.split("\n").find((line) => /consent passage|must not use/.test(line));
  console.log(`${id}: ${ok ? "failed as expected" : "UNEXPECTED"} :: ${hit ?? result.output.slice(0, 120)}`);
}

restore();
const after = runCopy();
console.log(`AFTER_REVERT ok=${after.ok} unexpected=${unexpected}`);
process.exit(unexpected === 0 && after.ok ? 0 : 1);
