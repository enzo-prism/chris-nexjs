import fs from "fs";
import path from "path";
import { officeInfo } from "../shared/officeInfo";

const workspaceRoot = process.cwd();

const bannedLiterals = [
  officeInfo.phone,
  officeInfo.phoneE164,
  officeInfo.address.line1,
  officeInfo.address.line2,
  officeInfo.mapUrl,
  officeInfo.hours.monday,
  officeInfo.hours.friday,
].filter(Boolean);

const rootsToScan = [
  path.join(workspaceRoot, "client", "src"),
  path.join(workspaceRoot, "shared"),
  path.join(workspaceRoot, "server"),
];

const ignoredPaths = new Set(
  [
    path.join(workspaceRoot, "shared", "officeInfo.ts"),
    path.join(workspaceRoot, "server", "storage.ts"), // marketing copy may include NAP
  ].map((entry) => path.normalize(entry)),
);

const allowedExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);

type Hit = {
  file: string;
  literal: string;
};

function shouldIgnore(filePath: string): boolean {
  const normalized = path.normalize(filePath);
  if (ignoredPaths.has(normalized)) return true;
  if (normalized.includes(`${path.sep}node_modules${path.sep}`)) return true;
  if (normalized.includes(`${path.sep}dist${path.sep}`)) return true;
  if (normalized.includes(`${path.sep}attached_assets${path.sep}`)) return true;
  return false;
}

function walkDir(dir: string, hits: Hit[]): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (shouldIgnore(fullPath)) continue;
    if (entry.isDirectory()) {
      walkDir(fullPath, hits);
      continue;
    }
    if (!allowedExtensions.has(path.extname(entry.name))) continue;
    const content = fs.readFileSync(fullPath, "utf8");
    for (const literal of bannedLiterals) {
      if (content.includes(literal)) {
        hits.push({ file: path.relative(workspaceRoot, fullPath), literal });
      }
    }
  }
}

function main(): void {
  const hits: Hit[] = [];
  for (const root of rootsToScan) {
    walkDir(root, hits);
  }

  if (hits.length === 0) {
    console.log("Business info check passed.");
    return;
  }

  console.error("Hard-coded business identity literals found:");
  for (const hit of hits) {
    console.error(`- ${hit.file}: "${hit.literal}"`);
  }
  process.exit(1);
}

main();

