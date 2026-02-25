import { execSync } from "node:child_process";

const DEFAULT_CHROME_FLAGS =
  "--headless --no-sandbox --disable-dev-shm-usage";

const budgets = [
  {
    url: "https://www.chriswongdds.com/",
    minPerformance: 0.85,
    maxLcpMs: 2800,
    maxCls: 0.1,
    maxTbtMs: 200,
  },
  {
    url: "https://www.chriswongdds.com/services",
    minPerformance: 0.8,
    maxLcpMs: 3200,
    maxCls: 0.1,
    maxTbtMs: 250,
  },
  {
    url: "https://www.chriswongdds.com/invisalign",
    minPerformance: 0.8,
    maxLcpMs: 3200,
    maxCls: 0.1,
    maxTbtMs: 250,
  },
  {
    url: "https://www.chriswongdds.com/dentist-menlo-park",
    minPerformance: 0.8,
    maxLcpMs: 3200,
    maxCls: 0.1,
    maxTbtMs: 250,
  },
];

function runLighthouse(url) {
  const command = [
    "npx --yes lighthouse",
    url,
    `--chrome-flags='${DEFAULT_CHROME_FLAGS}'`,
    "--only-categories=performance,seo",
    "--output=json",
    "--output-path=stdout",
    "--quiet",
  ].join(" ");

  const stdout = execSync(command, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 10 * 1024 * 1024,
  });

  return JSON.parse(stdout);
}

function fmtMs(value) {
  return `${Math.round(value)}ms`;
}

const failures = [];

for (const budget of budgets) {
  const report = runLighthouse(budget.url);
  const performance = report.categories.performance.score ?? 0;
  const lcp = report.audits["largest-contentful-paint"]?.numericValue ?? Infinity;
  const cls = report.audits["cumulative-layout-shift"]?.numericValue ?? Infinity;
  const tbt = report.audits["total-blocking-time"]?.numericValue ?? Infinity;

  console.log(
    [
      budget.url,
      `perf=${performance.toFixed(2)}`,
      `lcp=${fmtMs(lcp)}`,
      `cls=${cls.toFixed(3)}`,
      `tbt=${fmtMs(tbt)}`,
    ].join(" | "),
  );

  if (performance < budget.minPerformance) {
    failures.push(
      `${budget.url}: performance ${performance.toFixed(2)} < ${budget.minPerformance.toFixed(2)}`,
    );
  }
  if (lcp > budget.maxLcpMs) {
    failures.push(`${budget.url}: LCP ${fmtMs(lcp)} > ${fmtMs(budget.maxLcpMs)}`);
  }
  if (cls > budget.maxCls) {
    failures.push(`${budget.url}: CLS ${cls.toFixed(3)} > ${budget.maxCls.toFixed(3)}`);
  }
  if (tbt > budget.maxTbtMs) {
    failures.push(`${budget.url}: TBT ${fmtMs(tbt)} > ${fmtMs(budget.maxTbtMs)}`);
  }
}

if (failures.length) {
  console.error("\nLighthouse budget failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("\nLighthouse budget passed.");
