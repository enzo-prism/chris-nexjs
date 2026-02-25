import fs from "node:fs";
import path from "node:path";

type Finding = {
  file: string;
  line: number;
  tag: string;
};

const TARGET_DIRECTORIES = [
  "client/src/components/common",
  "client/src/components/forms",
  "client/src/components/layout",
  "client/src/components/sections",
] as const;

const TSX_EXTENSIONS = new Set([".tsx", ".ts"]);
const DISALLOWED_CONTROL_PATTERN = /<(button|input|select|textarea)(?=[\s>])/g;

function walkFilesRecursively(directoryPath: string): string[] {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFilesRecursively(absolutePath));
      continue;
    }

    if (!TSX_EXTENSIONS.has(path.extname(entry.name))) continue;
    files.push(absolutePath);
  }

  return files;
}

function lineNumberForIndex(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}

function findDisallowedControls(filePath: string): Finding[] {
  const relativeFile = path.relative(process.cwd(), filePath);

  if (relativeFile.startsWith("client/src/components/ui/")) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf8");
  const findings: Finding[] = [];

  for (const match of content.matchAll(DISALLOWED_CONTROL_PATTERN)) {
    const tag = match[1];
    if (!tag || typeof match.index !== "number") continue;
    findings.push({
      file: relativeFile,
      line: lineNumberForIndex(content, match.index),
      tag,
    });
  }

  return findings;
}

function main() {
  const findings: Finding[] = [];

  for (const directory of TARGET_DIRECTORIES) {
    const absoluteDirectory = path.join(process.cwd(), directory);
    if (!fs.existsSync(absoluteDirectory)) continue;

    const files = walkFilesRecursively(absoluteDirectory);
    for (const filePath of files) {
      findings.push(...findDisallowedControls(filePath));
    }
  }

  if (findings.length > 0) {
    console.error(
      "Design system guard failed: use shadcn form/button primitives in shared UI layers.",
    );
    for (const finding of findings) {
      console.error(`- ${finding.file}:${finding.line} uses raw <${finding.tag}>`);
    }
    process.exit(1);
  }

  console.log("Design system guard passed.");
}

main();
