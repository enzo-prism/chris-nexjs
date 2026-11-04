// Unit mutants for sms-pixel-truth.ts. Each edit runs
// scripts/sms-pixel-truth.test.ts only.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const path = "scripts/sms-pixel-truth.ts";
const original = readFileSync(path, "utf8");

const MUTANTS = [
  {
    id: "U7",
    description: "remove the marketing qualifier from TWILIO_OCR_PHRASES",
    apply: (source) =>
      source.replace(
        /\n  MARKETING_QUALIFIER_OCR_PHRASE,/,
        "\n  // MARKETING_QUALIFIER_OCR_PHRASE,",
      ),
    expect: "fail",
  },
  {
    id: "U5",
    description: "move OCR_MAX_DISTANCE from 0.1 to 0.2",
    apply: (source) => source.replace("export const OCR_MAX_DISTANCE = 0.1;", "export const OCR_MAX_DISTANCE = 0.2;"),
    expect: "fail",
  },
  {
    id: "U3",
    description: "!(exactPhrase && exactNegation) is equivalent to !exactPhrase || !exactNegation",
    apply: (source) =>
      source.replace(
        "if (!exactPhrase || !exactNegation) missed.push(phrase);",
        "if (!(exactPhrase && exactNegation)) missed.push(phrase);",
      ),
    expect: "equivalent",
  },
];

function restore() {
  writeFileSync(path, original);
}

function runUnits() {
  try {
    execFileSync("pnpm", ["exec", "tsx", "scripts/sms-pixel-truth.test.ts"], { encoding: "utf8" });
    return { ok: true, output: "" };
  } catch (error) {
    return { ok: false, output: `${error.stdout ?? ""}${error.stderr ?? ""}` };
  }
}

restore();
const control = runUnits();
console.log(`UNIT_CONTROL ok=${control.ok}`);
if (!control.ok) {
  console.log(control.output);
  process.exit(1);
}

let unexpected = 0;
for (const mutant of MUTANTS) {
  restore();
  writeFileSync(path, mutant.apply(original));
  const result = runUnits();
  if (mutant.expect === "equivalent") {
    const ok = result.ok === true;
    if (!ok) unexpected += 1;
    console.log(
      `${mutant.id}: ${ok ? "equivalent (survives, as noted)" : "UNEXPECTED fail"} :: ${mutant.description}`,
    );
    continue;
  }
  const ok = result.ok === false;
  if (!ok) unexpected += 1;
  const hit = result.output.split("\n").find((line) => /U7|U5|AssertionError|must include/.test(line));
  console.log(`${mutant.id}: ${ok ? "failed as expected" : "UNEXPECTED"} :: ${hit ?? result.output.slice(0, 160)}`);
}

restore();
const after = runUnits();
console.log(`AFTER_REVERT ok=${after.ok} unexpected=${unexpected}`);
process.exit(unexpected === 0 && after.ok ? 0 : 1);
