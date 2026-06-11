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
  officeInfo.hours.wednesday,
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
    path.join(workspaceRoot, "client", "src", "data", "changelog.ts"), // generated commit history can include historical literals
  ].map((entry) => path.normalize(entry)),
);

// Editorial rule: the doctor name is either "Dr. Christopher B. Wong" or
// "Christopher B. Wong, DDS" — never "Dr. <name> DDS" combined. This pattern
// matches a name immediately following "Dr." and immediately preceding "DDS"
// so prose that merely mentions both forms far apart in one paragraph passes.
const DR_DDS_COMBINED_PATTERN = /Dr\.\s+(?:[A-Z][a-z]+|[A-Z]\.)(?:\s+(?:[A-Z][a-z]+|[A-Z]\.)){0,3},?\s+DDS\b/;

const namingRuleRoots = [
  ...rootsToScan,
  path.join(workspaceRoot, "app"),
];

const namingRuleIgnoredPaths = new Set(
  [
    // Verbatim third-party Google review text is quoted as written.
    path.join(workspaceRoot, "shared", "googleReviewsData.ts"),
    path.join(workspaceRoot, "client", "src", "data", "changelog.ts"),
  ].map((entry) => path.normalize(entry)),
);

const allowedExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);

type Hit = {
  file: string;
  literal: string;
};

function isVendorOrGeneratedPath(filePath: string): boolean {
  const normalized = path.normalize(filePath);
  if (normalized.includes(`${path.sep}node_modules${path.sep}`)) return true;
  if (normalized.includes(`${path.sep}dist${path.sep}`)) return true;
  if (normalized.includes(`${path.sep}attached_assets${path.sep}`)) return true;
  if (normalized.includes(`${path.sep}.next`)) return true;
  return false;
}

function shouldIgnore(filePath: string): boolean {
  if (ignoredPaths.has(path.normalize(filePath))) return true;
  return isVendorOrGeneratedPath(filePath);
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

type NamingHit = {
  file: string;
  line: number;
  text: string;
};

function walkDirForNamingRule(dir: string, hits: NamingHit[]): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (isVendorOrGeneratedPath(fullPath)) continue;
    if (namingRuleIgnoredPaths.has(path.normalize(fullPath))) continue;
    if (entry.isDirectory()) {
      walkDirForNamingRule(fullPath, hits);
      continue;
    }
    if (!allowedExtensions.has(path.extname(entry.name))) continue;
    const lines = fs.readFileSync(fullPath, "utf8").split("\n");
    lines.forEach((lineText, index) => {
      const match = lineText.match(DR_DDS_COMBINED_PATTERN);
      if (match) {
        hits.push({
          file: path.relative(workspaceRoot, fullPath),
          line: index + 1,
          text: match[0],
        });
      }
    });
  }
}

function main(): void {
  const hits: Hit[] = [];
  for (const root of rootsToScan) {
    walkDir(root, hits);
  }

  const namingHits: NamingHit[] = [];
  for (const root of namingRuleRoots) {
    walkDirForNamingRule(root, namingHits);
  }

  if (hits.length === 0 && namingHits.length === 0) {
    console.log("Business info check passed.");
    return;
  }

  if (hits.length > 0) {
    console.error("Hard-coded business identity literals found:");
    for (const hit of hits) {
      console.error(`- ${hit.file}: "${hit.literal}"`);
    }
  }

  if (namingHits.length > 0) {
    console.error(
      'Doctor naming rule violated ("Dr." and "DDS" combined in one name):',
    );
    for (const hit of namingHits) {
      console.error(`- ${hit.file}:${hit.line}: "${hit.text}"`);
    }
  }

  process.exit(1);
}

main();
