import { execSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  createdLauncherDirs,
  killChromeForUserDataDir,
  listLauncherUserDataDirs,
} from "./lighthouse-chrome.mjs";

const DEFAULT_CHROME_FLAGS =
  "--headless --no-sandbox --disable-dev-shm-usage";

const baseUrl = (
  process.env.LIGHTHOUSE_BASE_URL || "https://www.chriswongdds.com"
).replace(/\/+$/, "");

const runsPerRoute = Number.parseInt(process.env.LIGHTHOUSE_RUNS || "3", 10);
const skipPrecheck = process.env.LIGHTHOUSE_SKIP_PRECHECK === "1";
const DEFAULT_LAUNCH_RETRIES = 3;

function parseLaunchRetries(raw) {
  if (raw == null || raw === "") {
    return DEFAULT_LAUNCH_RETRIES;
  }
  const parsed = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    console.warn(
      `LIGHTHOUSE_LAUNCH_RETRIES=${JSON.stringify(raw)} is not a valid count; using ${DEFAULT_LAUNCH_RETRIES}.`,
    );
    return DEFAULT_LAUNCH_RETRIES;
  }
  return parsed;
}

const launchRetries = parseLaunchRetries(process.env.LIGHTHOUSE_LAUNCH_RETRIES);

const budgets = [
  {
    path: "/",
    minPerformance: Number.parseFloat(
      process.env.LIGHTHOUSE_HOME_MIN_PERF || "0.8",
    ),
    maxLcpMs: Number.parseFloat(
      process.env.LIGHTHOUSE_HOME_MAX_LCP_MS || "3200",
    ),
    maxCls: Number.parseFloat(process.env.LIGHTHOUSE_HOME_MAX_CLS || "0.1"),
    maxTbtMs: Number.parseFloat(
      process.env.LIGHTHOUSE_HOME_MAX_TBT_MS || "250",
    ),
  },
  {
    path: "/services",
    minPerformance: Number.parseFloat(
      process.env.LIGHTHOUSE_SERVICES_MIN_PERF || "0.85",
    ),
    maxLcpMs: Number.parseFloat(
      process.env.LIGHTHOUSE_SERVICES_MAX_LCP_MS || "3600",
    ),
    maxCls: Number.parseFloat(
      process.env.LIGHTHOUSE_SERVICES_MAX_CLS || "0.1",
    ),
    maxTbtMs: Number.parseFloat(
      process.env.LIGHTHOUSE_SERVICES_MAX_TBT_MS || "250",
    ),
  },
  {
    path: "/invisalign",
    minPerformance: Number.parseFloat(
      process.env.LIGHTHOUSE_INVISALIGN_MIN_PERF || "0.75",
    ),
    maxLcpMs: Number.parseFloat(
      process.env.LIGHTHOUSE_INVISALIGN_MAX_LCP_MS || "5000",
    ),
    maxCls: Number.parseFloat(
      process.env.LIGHTHOUSE_INVISALIGN_MAX_CLS || "0.1",
    ),
    maxTbtMs: Number.parseFloat(
      process.env.LIGHTHOUSE_INVISALIGN_MAX_TBT_MS || "250",
    ),
  },
  {
    path: "/dentist-menlo-park",
    minPerformance: Number.parseFloat(
      process.env.LIGHTHOUSE_DENTIST_MENLO_PARK_MIN_PERF || "0.85",
    ),
    maxLcpMs: Number.parseFloat(
      process.env.LIGHTHOUSE_DENTIST_MENLO_PARK_MAX_LCP_MS || "3600",
    ),
    maxCls: Number.parseFloat(
      process.env.LIGHTHOUSE_DENTIST_MENLO_PARK_MAX_CLS || "0.1",
    ),
    maxTbtMs: Number.parseFloat(
      process.env.LIGHTHOUSE_DENTIST_MENLO_PARK_MAX_TBT_MS || "250",
    ),
  },
  {
    path: "/gallery",
    minPerformance: Number.parseFloat(
      process.env.LIGHTHOUSE_GALLERY_MIN_PERF || "0.8",
    ),
    maxLcpMs: Number.parseFloat(
      process.env.LIGHTHOUSE_GALLERY_MAX_LCP_MS || "4000",
    ),
    maxCls: Number.parseFloat(
      process.env.LIGHTHOUSE_GALLERY_MAX_CLS || "0.1",
    ),
    maxTbtMs: Number.parseFloat(
      process.env.LIGHTHOUSE_GALLERY_MAX_TBT_MS || "350",
    ),
  },
  {
    path: "/schedule",
    minPerformance: Number.parseFloat(
      process.env.LIGHTHOUSE_SCHEDULE_MIN_PERF || "0.8",
    ),
    maxLcpMs: Number.parseFloat(
      process.env.LIGHTHOUSE_SCHEDULE_MAX_LCP_MS || "4000",
    ),
    maxCls: Number.parseFloat(
      process.env.LIGHTHOUSE_SCHEDULE_MAX_CLS || "0.1",
    ),
    maxTbtMs: Number.parseFloat(
      process.env.LIGHTHOUSE_SCHEDULE_MAX_TBT_MS || "350",
    ),
  },
];

function isChromeLaunchFlake(error) {
  const message = `${error?.message ?? ""} ${error?.stderr ?? ""}`;
  return /waiting for dynamic debugging port/i.test(message);
}

async function runLighthouseOnce(url) {
  const userDataDir = mkdtempSync(join(tmpdir(), "lighthouse-cw-"));
  const launcherDirsBefore = listLauncherUserDataDirs();
  const command = [
    "npx --yes lighthouse",
    url,
    `--chrome-flags='${DEFAULT_CHROME_FLAGS} --user-data-dir=${userDataDir}'`,
    "--only-categories=performance,seo",
    "--throttling-method=provided",
    "--output=json",
    "--output-path=stdout",
    "--quiet",
  ].join(" ");

  try {
    const stdout = execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 16 * 1024 * 1024,
    });
    return JSON.parse(stdout);
  } finally {
    await killChromeForUserDataDir(userDataDir, {
      extraDirs: createdLauncherDirs(launcherDirsBefore),
    });
  }
}

async function runLighthouse(url) {
  const attempts = Math.max(1, launchRetries);
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await runLighthouseOnce(url);
    } catch (error) {
      lastError = error;
      if (!isChromeLaunchFlake(error) || attempt === attempts) {
        throw error;
      }
      console.warn(
        `Lighthouse Chrome launch failed (attempt ${attempt}/${attempts}), retrying...`,
      );
    }
  }

  throw lastError;
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

async function summarizeRuns(url, runCount) {
  const samples = [];

  for (let index = 0; index < runCount; index += 1) {
    const report = await runLighthouse(url);
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
    const summary = await summarizeRuns(targetUrl, Math.max(1, runsPerRoute));
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
