import { execSync } from "node:child_process";

const DEFAULT_CHROME_FLAGS =
  "--headless --no-sandbox --disable-dev-shm-usage";

const baseUrl = (
  process.env.LIGHTHOUSE_BASE_URL || "https://www.chriswongdds.com"
).replace(/\/+$/, "");

const runsPerRoute = Number.parseInt(process.env.LIGHTHOUSE_RUNS || "2", 10);
const skipPrecheck = process.env.LIGHTHOUSE_SKIP_PRECHECK === "1";

const budgets = [
  {
    path: "/",
    minPerformance: 0.8,
    maxLcpMs: 4500,
    maxCls: 0.1,
    maxTbtMs: 250,
  },
  {
    path: "/services",
    minPerformance: 0.85,
    maxLcpMs: 3600,
    maxCls: 0.1,
    maxTbtMs: 250,
  },
  {
    path: "/invisalign",
    minPerformance: 0.75,
    maxLcpMs: 8200,
    maxCls: 0.1,
    maxTbtMs: 250,
  },
  {
    path: "/dentist-menlo-park",
    minPerformance: 0.85,
    maxLcpMs: 3600,
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
    maxBuffer: 16 * 1024 * 1024,
  });

  return JSON.parse(stdout);
}

function fmtMs(value) {
  return `${Math.round(value)}ms`;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
  }
  return sorted[midpoint];
}

async function precheckRoute(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
    headers: {
      Accept: "text/html,*/*;q=0.8",
      "User-Agent": "chris-nextjs-lighthouse-precheck/1.0",
    },
  });

  const contentType = (response.headers.get("content-type") || "").toLowerCase();

  const failures = [];
  if (response.status >= 400) {
    failures.push(`status ${response.status}`);
  }
  if (!contentType.includes("text/html")) {
    failures.push(`content-type "${contentType || "missing"}"`);
  }

  return {
    ok: failures.length === 0,
    failures,
  };
}

async function assertPrecheck() {
  const issues = [];

  for (const budget of budgets) {
    const url = `${baseUrl}${budget.path}`;
    const result = await precheckRoute(url);
    if (!result.ok) {
      issues.push(`${url}: ${result.failures.join(", ")}`);
    }
  }

  if (issues.length) {
    console.error("Lighthouse precheck failed:");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    console.error(
      "\nFix route/server health first or run with LIGHTHOUSE_SKIP_PRECHECK=1 to bypass.",
    );
    process.exit(1);
  }
}

function summarizeRuns(url, runCount) {
  const samples = [];

  for (let index = 0; index < runCount; index += 1) {
    const report = runLighthouse(url);
    samples.push({
      performance: report.categories.performance.score ?? 0,
      lcp:
        report.audits["largest-contentful-paint"]?.numericValue ?? Infinity,
      cls: report.audits["cumulative-layout-shift"]?.numericValue ?? Infinity,
      tbt: report.audits["total-blocking-time"]?.numericValue ?? Infinity,
    });
  }

  return {
    performance: median(samples.map((sample) => sample.performance)),
    lcp: median(samples.map((sample) => sample.lcp)),
    cls: median(samples.map((sample) => sample.cls)),
    tbt: median(samples.map((sample) => sample.tbt)),
  };
}

async function main() {
  if (!skipPrecheck) {
    await assertPrecheck();
  }

  const failures = [];

  for (const budget of budgets) {
    const targetUrl = `${baseUrl}${budget.path}`;
    const summary = summarizeRuns(targetUrl, Math.max(1, runsPerRoute));
    const performance = summary.performance;
    const lcp = summary.lcp;
    const cls = summary.cls;
    const tbt = summary.tbt;

    console.log(
      [
        targetUrl,
        `runs=${Math.max(1, runsPerRoute)}`,
        `perf=${performance.toFixed(2)}`,
        `lcp=${fmtMs(lcp)}`,
        `cls=${cls.toFixed(3)}`,
        `tbt=${fmtMs(tbt)}`,
      ].join(" | "),
    );

    if (performance < budget.minPerformance) {
      failures.push(
        `${targetUrl}: performance ${performance.toFixed(2)} < ${budget.minPerformance.toFixed(2)}`,
      );
    }
    if (lcp > budget.maxLcpMs) {
      failures.push(`${targetUrl}: LCP ${fmtMs(lcp)} > ${fmtMs(budget.maxLcpMs)}`);
    }
    if (cls > budget.maxCls) {
      failures.push(`${targetUrl}: CLS ${cls.toFixed(3)} > ${budget.maxCls.toFixed(3)}`);
    }
    if (tbt > budget.maxTbtMs) {
      failures.push(`${targetUrl}: TBT ${fmtMs(tbt)} > ${fmtMs(budget.maxTbtMs)}`);
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
}

main().catch((error) => {
  console.error("Lighthouse budget failed:", error);
  process.exit(1);
});
