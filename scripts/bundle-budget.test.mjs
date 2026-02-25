import { execSync } from "node:child_process";

const CORE_MAX_KB = Number.parseFloat(process.env.BUNDLE_CORE_MAX_KB || "170");
const DEFAULT_MARKETING_MAX_KB = Number.parseFloat(
  process.env.BUNDLE_MARKETING_MAX_KB || "220",
);
const ANALYTICS_MAX_KB = Number.parseFloat(
  process.env.BUNDLE_ANALYTICS_MAX_KB || "520",
);

const CRITICAL_ROUTE_BUDGETS = new Map([
  ["/", CORE_MAX_KB],
  ["/services", CORE_MAX_KB],
  ["/invisalign", CORE_MAX_KB],
  ["/dentist-menlo-park", CORE_MAX_KB],
  ["/analytics", ANALYTICS_MAX_KB],
]);

function parseRouteLine(line) {
  const match = line.match(
    /^\s*[┌├└│]\s*[○ƒ]\s+(\S+)\s+.*?(\d+(?:\.\d+)?)\s*kB\s*$/,
  );
  if (!match) return null;

  return {
    route: match[1],
    firstLoadKb: Number.parseFloat(match[2]),
  };
}

function getBudgetForRoute(route) {
  if (CRITICAL_ROUTE_BUDGETS.has(route)) {
    return CRITICAL_ROUTE_BUDGETS.get(route);
  }
  if (route.startsWith("/api/")) return null;
  if (route === "/_not-found") return null;
  return DEFAULT_MARKETING_MAX_KB;
}

function runBuildAndCollectOutput() {
  const command = "pnpm exec next build";
  return execSync(command, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 32 * 1024 * 1024,
  });
}

function main() {
  const stdout = runBuildAndCollectOutput();
  const lines = stdout.split(/\r?\n/);
  const failures = [];
  const seenCritical = new Set();

  for (const line of lines) {
    const parsed = parseRouteLine(line);
    if (!parsed) continue;

    const budgetKb = getBudgetForRoute(parsed.route);
    if (budgetKb === null) continue;

    if (CRITICAL_ROUTE_BUDGETS.has(parsed.route)) {
      seenCritical.add(parsed.route);
    }

    console.log(
      `${parsed.route.padEnd(26)} ${`${parsed.firstLoadKb.toFixed(1)}kB`.padStart(10)} / ${`${budgetKb.toFixed(1)}kB`.padStart(10)}`,
    );

    if (parsed.firstLoadKb > budgetKb) {
      failures.push(
        `${parsed.route}: ${parsed.firstLoadKb.toFixed(1)}kB exceeds budget ${budgetKb.toFixed(1)}kB`,
      );
    }
  }

  for (const criticalRoute of CRITICAL_ROUTE_BUDGETS.keys()) {
    if (!seenCritical.has(criticalRoute)) {
      failures.push(`critical route missing from build output: ${criticalRoute}`);
    }
  }

  if (failures.length) {
    console.error("\nBundle budget failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("\nBundle budget passed.");
}

main();
