import { spawn } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HELPER = "shared/analyticsHosts.ts";
const LAYOUT = "app/layout.tsx";
const ANALYTICS = "client/src/lib/analytics.ts";
const GA_COMPONENT = "client/src/components/common/GoogleAnalytics.tsx";
const HOTJAR = "client/src/components/common/HotjarTracking.tsx";
const VERCEL = "client/src/components/common/VercelAnalytics.tsx";

const UNIT =
  "tsx --test shared/analyticsHosts.test.ts scripts/analytics-gate-source.test.ts && tsx client/src/lib/analytics.test.ts";

const ALLOW_TITLE = "www.chriswongdds.com loads gtag and fires page_view";
const E2E_TITLES = [
  ALLOW_TITLE,
  "non-production hosts do not load or collect to GA4/GTM",
  "chriswongdds.com.evil.com does not load gtag or Hotjar",
  "evilchriswongdds.com does not load gtag or Hotjar",
];

const PIXEL_INJECTION = `(function(){var s=document.createElement('script');s.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(s);if(navigator.sendBeacon)navigator.sendBeacon('https://www.facebook.com/tr?ev=PageView','');try{new WebSocket('wss://edge-chat.facebook.com/chat');}catch(e){}try{new EventSource('https://connect.facebook.net/stream');}catch(e){}})();`;

export function classifyChildResult(result) {
  if (result.signal || result.status === null) return "aborted";
  if (result.status === 0) return "survived";
  return "killed";
}

function createSandbox() {
  const dir = mkdtempSync(join(tmpdir(), "cw-analytics-mutants-"));
  cpSync(ROOT, dir, {
    recursive: true,
    filter(src) {
      const base = src.slice(ROOT.length);
      if (src === join(ROOT, "node_modules") || base.includes("/node_modules")) {
        return false;
      }
      if (
        src === join(ROOT, ".next") ||
        src === join(ROOT, ".next-perf") ||
        base.includes("/.next")
      ) {
        return false;
      }
      if (src === join(ROOT, ".git") || base.startsWith("/.git/")) {
        return false;
      }
      return true;
    },
  });
  symlinkSync(join(ROOT, "node_modules"), join(dir, "node_modules"));
  return dir;
}

function destroySandbox(dir) {
  rmSync(dir, { recursive: true, force: true });
}

function killProcessGroup(pid, signal = "SIGTERM") {
  if (!pid) return false;
  try {
    process.kill(-pid, signal);
    return true;
  } catch {
    try {
      process.kill(pid, signal);
      return true;
    } catch {
      return false;
    }
  }
}

function waitClosed(child, timeoutMs = 8_000) {
  if (!child || child.exitCode !== null || child.signalCode) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    child.once("close", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

let currentChild = null;

function run(command, cwd, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, ...extraEnv };
    const child = spawn(command, {
      shell: true,
      cwd,
      env,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    currentChild = child;
    const forward = (signal) => {
      killProcessGroup(child.pid, signal);
    };
    process.on("SIGINT", forward);
    process.on("SIGTERM", forward);
    process.on("SIGHUP", forward);
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    const detach = () => {
      process.off("SIGINT", forward);
      process.off("SIGTERM", forward);
      process.off("SIGHUP", forward);
      if (currentChild === child) currentChild = null;
    };
    child.on("error", (error) => {
      detach();
      reject(error);
    });
    child.on("close", (status, signal) => {
      detach();
      resolve({ status, signal, stdout, stderr });
    });
  });
}

function collectFailedTitles(suite, titles = []) {
  if (!suite || typeof suite !== "object") return titles;
  for (const spec of suite.specs ?? []) {
    const failed = (spec.tests ?? []).some((test) =>
      (test.results ?? []).some(
        (result) => result.status === "unexpected" || result.status === "failed",
      ),
    );
    if (failed && spec.title) titles.push(spec.title);
  }
  for (const child of suite.suites ?? []) {
    collectFailedTitles(child, titles);
  }
  return titles;
}

function parsePlaywrightJson(stdout) {
  const start = stdout.indexOf("{");
  const end = stdout.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("playwright json reporter produced no object");
  }
  return JSON.parse(stdout.slice(start, end + 1));
}

function e2eRequiredTitlesFailed(result, mustFail) {
  const report = parsePlaywrightJson(result.stdout);
  const failed = new Set(collectFailedTitles(report));
  return {
    failed: [...failed],
    ok: mustFail.every((title) => failed.has(title)),
  };
}

const mutants = [
  {
    name: "noop",
    expectKilled: false,
    tests: ["unit"],
    apply() {},
  },
  {
    name: "remove-gate",
    expectKilled: true,
    tests: ["unit"],
    apply(apply) {
      apply(
        HELPER,
        `  if (typeof hostname !== "string") return false;
  const normalized = normalizeAnalyticsHostname(hostname);
  if (!normalized) return false;
  return ANALYTICS_ALLOWED_HOST_SET.has(normalized);`,
        `  return true;`,
      );
      apply(
        HELPER,
        `    if (__cwAnalyticsAllowedHosts.indexOf(__cwAnalyticsHost) === -1) return;`,
        `    /* host gate removed */`,
      );
      apply(
        LAYOUT,
        `    \${analyticsHostAllowlistGuardSnippet()}
`,
        ``,
      );
    },
  },
  {
    name: "includes(chriswongdds.com)",
    expectKilled: true,
    tests: ["unit"],
    apply(apply) {
      apply(
        HELPER,
        `  return ANALYTICS_ALLOWED_HOST_SET.has(normalized);`,
        `  return normalized.includes("chriswongdds.com");`,
      );
      apply(
        HELPER,
        `    if (__cwAnalyticsAllowedHosts.indexOf(__cwAnalyticsHost) === -1) return;`,
        `    if (__cwAnalyticsHost.includes("chriswongdds.com") === false) return;`,
      );
    },
  },
  {
    name: "endsWith(chriswongdds.com)",
    expectKilled: true,
    tests: ["unit"],
    apply(apply) {
      apply(
        HELPER,
        `  return ANALYTICS_ALLOWED_HOST_SET.has(normalized);`,
        `  return normalized.endsWith("chriswongdds.com");`,
      );
      apply(
        HELPER,
        `    if (__cwAnalyticsAllowedHosts.indexOf(__cwAnalyticsHost) === -1) return;`,
        `    if (__cwAnalyticsHost.endsWith("chriswongdds.com") === false) return;`,
      );
    },
  },
  {
    name: "drop-www",
    expectKilled: true,
    tests: ["unit"],
    apply(apply) {
      apply(
        HELPER,
        `export const ANALYTICS_ALLOWED_HOSTS = [
  "chriswongdds.com",
  "www.chriswongdds.com",
] as const;`,
        `export const ANALYTICS_ALLOWED_HOSTS = [
  "chriswongdds.com",
] as const;`,
      );
    },
  },
  {
    name: "stringified-list-includes",
    expectKilled: true,
    tests: ["unit"],
    apply(apply) {
      apply(
        HELPER,
        `  return ANALYTICS_ALLOWED_HOST_SET.has(normalized);`,
        `  return JSON.stringify(ANALYTICS_ALLOWED_HOSTS).includes(normalized);`,
      );
      apply(
        HELPER,
        `    if (__cwAnalyticsAllowedHosts.indexOf(__cwAnalyticsHost) === -1) return;`,
        `    if (!__cwAnalyticsHost) return;
    if (JSON.stringify(__cwAnalyticsAllowedHosts).includes(__cwAnalyticsHost) === false) return;`,
      );
    },
  },
  {
    name: "strip-trailing-dot",
    expectKilled: true,
    tests: ["unit"],
    apply(apply) {
      apply(
        HELPER,
        `  const trimmed = hostname.trim().toLowerCase();`,
        `  const trimmed = hostname.trim().toLowerCase().replace(/\\.+$/, "");`,
      );
      apply(
        HELPER,
        `      __cwAnalyticsHost = String(location.hostname || "").toLowerCase();`,
        `      __cwAnalyticsHost = String(location.hostname || "").toLowerCase().replace(/\\.+$/, "");`,
      );
    },
  },
  {
    name: "ungate-ads-conversion",
    expectKilled: true,
    tests: ["unit"],
    apply(apply) {
      apply(
        ANALYTICS,
        `    typeof window.gtag !== "function" ||
    !isAnalyticsRuntimeEnabled() ||
    !hasAnalyticsConsent()
  ) {
    return;
  }

  const sendTo = GOOGLE_ADS_CONVERSION_LABEL`,
        `    typeof window.gtag !== "function" ||
    !hasAnalyticsConsent()
  ) {
    return;
  }

  const sendTo = GOOGLE_ADS_CONVERSION_LABEL`,
      );
    },
  },
  {
    name: "ungate-page-view",
    expectKilled: true,
    tests: ["unit"],
    apply(apply) {
      apply(
        GA_COMPONENT,
        `        shouldSkipTracking ||
        !isAnalyticsRuntimeEnabled() ||
        !hasAnalyticsConsent()`,
        `        shouldSkipTracking ||
        !hasAnalyticsConsent()`,
      );
    },
  },
  {
    name: "sendPageView-and-false",
    expectKilled: true,
    tests: ["unit"],
    apply(apply) {
      apply(
        GA_COMPONENT,
        `        shouldSkipTracking ||
        !isAnalyticsRuntimeEnabled() ||
        !hasAnalyticsConsent()`,
        `        shouldSkipTracking ||
        (!isAnalyticsRuntimeEnabled() && false) ||
        !hasAnalyticsConsent()`,
      );
    },
  },
  {
    name: "hotjar-and-false",
    expectKilled: true,
    tests: ["unit"],
    apply(apply) {
      apply(
        HOTJAR,
        `    if (!isAllowedAnalyticsHost(window.location.hostname)) return;`,
        `    if (!isAllowedAnalyticsHost(window.location.hostname) && false) return;`,
      );
    },
  },
  {
    name: "vercel-setEnabled-true",
    expectKilled: true,
    tests: ["unit"],
    apply(apply) {
      apply(
        VERCEL,
        `    setEnabled(isAllowedAnalyticsHost(window.location.hostname));`,
        `    setEnabled(true);`,
      );
    },
  },
  {
    name: "e2e-noop",
    expectKilled: false,
    tests: ["e2e"],
    e2eMustFail: [],
    apply() {},
  },
  {
    name: "pixel-beacon-ws-eventsource",
    expectKilled: true,
    tests: ["e2e"],
    e2eMustFail: E2E_TITLES,
    apply(apply) {
      apply(
        LAYOUT,
        `        <script dangerouslySetInnerHTML={{ __html: googleTagBootstrap }} />
        <SeasonScript />`,
        `        <script dangerouslySetInnerHTML={{ __html: googleTagBootstrap }} />
        <script dangerouslySetInnerHTML={{ __html: ${JSON.stringify(PIXEL_INJECTION)} }} />
        <SeasonScript />`,
      );
    },
  },
  {
    name: "page_view-send_to-wrong-id",
    expectKilled: true,
    tests: ["e2e"],
    e2eMustFail: [ALLOW_TITLE],
    apply(apply) {
      apply(
        GA_COMPONENT,
        `        send_to: GA_MEASUREMENT_ID,`,
        `        send_to: "G-EGGWRONG00",`,
      );
    },
  },
  {
    name: "layout-config-wrong-id",
    expectKilled: true,
    tests: ["e2e"],
    e2eMustFail: [ALLOW_TITLE],
    apply(apply) {
      apply(
        LAYOUT,
        `  gtag('config', '\${GA_MEASUREMENT_ID}', {`,
        `  gtag('config', 'G-EGGWRONG00', {`,
      );
    },
  },
];

let sandbox = "";
let cleaned = false;
let shuttingDown = false;

function cleanup() {
  if (cleaned || !sandbox) return;
  cleaned = true;
  destroySandbox(sandbox);
}

async function shutdown(exitCode) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (currentChild?.pid) {
    killProcessGroup(currentChild.pid, "SIGTERM");
    await waitClosed(currentChild);
  }
  cleanup();
  process.exit(exitCode);
}

process.on("SIGINT", () => {
  void shutdown(130);
});
process.on("SIGTERM", () => {
  void shutdown(143);
});
process.on("SIGHUP", () => {
  void shutdown(129);
});
process.on("exit", cleanup);

function readSeed(file, originals) {
  if (!originals.has(file)) {
    originals.set(file, readFileSync(join(sandbox, file), "utf8"));
  }
  return originals.get(file);
}

function restoreSandbox(originals) {
  for (const [file, contents] of originals) {
    writeFileSync(join(sandbox, file), contents);
  }
}

function applyInSandbox(originals, file, from, to) {
  readSeed(file, originals);
  const current = readFileSync(join(sandbox, file), "utf8");
  if (!current.includes(from)) {
    throw new Error(`Mutant seed not found in ${file}: ${from}`);
  }
  writeFileSync(join(sandbox, file), current.replace(from, to));
}

async function signalAbortCheck() {
  const child = spawn("sleep", ["30"], {
    detached: true,
    stdio: "ignore",
  });
  await new Promise((resolve) => setTimeout(resolve, 80));
  killProcessGroup(child.pid, "SIGTERM");
  const result = await new Promise((resolve) => {
    child.on("close", (status, signal) => resolve({ status, signal }));
  });
  const classification = classifyChildResult(result);
  if (classification !== "aborted") {
    console.error(
      `UNEXPECTED signal-abort-check classified as ${classification} (status=${result.status}, signal=${result.signal})`,
    );
    await shutdown(1);
  }
  console.log(
    "PASSED  signal-abort-check (process-group SIGTERM on sleep is ABORTED, not a kill)",
  );
  return {
    name: "signal-abort-check",
    killed: false,
    expected: false,
    ok: true,
    classification,
  };
}

async function runMutantTests(mutant) {
  const kinds = mutant.tests ?? ["unit"];
  for (const kind of kinds) {
    if (kind === "unit") {
      const result = await run(UNIT, sandbox);
      const classification = classifyChildResult(result);
      if (classification === "aborted") return { ...result, classification };
      if (classification === "killed") return { ...result, classification };
      continue;
    }
    if (kind === "e2e") {
      const result = await run(
        "pnpm exec playwright test -c playwright.analytics.config.ts --reporter=json",
        sandbox,
        {
          ANALYTICS_MUTANT_E2E: "1",
          ANALYTICS_E2E_PORT: "3213",
          PLAYWRIGHT_BASE_URL: "",
          SEO_AUDIT_BASE_URL: "",
        },
      );
      const classification = classifyChildResult(result);
      if (classification === "aborted") return { ...result, classification };
      const mustFail = mutant.e2eMustFail ?? [];
      let report;
      try {
        report = e2eRequiredTitlesFailed(result, mustFail);
      } catch {
        return {
          ...result,
          classification: mutant.expectKilled ? "survived" : "killed",
          stdout: `${result.stdout}\ne2e reporter json was not parseable`,
        };
      }
      if (mutant.expectKilled) {
        if (!report.ok) {
          return {
            ...result,
            classification: "survived",
            failedTitles: report.failed,
            stdout: `${result.stdout}\nrequired titles did not fail: ${mustFail
              .filter((title) => !report.failed.includes(title))
              .join(", ")}`,
          };
        }
        return { ...result, classification: "killed", failedTitles: report.failed };
      }
      if (classification !== "survived" || report.failed.length > 0) {
        return {
          ...result,
          classification: "killed",
          failedTitles: report.failed,
        };
      }
      return { ...result, classification: "survived", failedTitles: [] };
    }
  }
  return { status: 0, signal: null, stdout: "", stderr: "", classification: "survived" };
}

sandbox = createSandbox();
const originals = new Map();
const results = [];

try {
  results.push(await signalAbortCheck());
  for (const mutant of mutants) {
    restoreSandbox(originals);
    mutant.apply((file, from, to) => applyInSandbox(originals, file, from, to));
    const result = await runMutantTests(mutant);
    if (result.classification === "aborted") {
      console.error(
        `ABORTED ${mutant.name} (${result.signal || "null status"})`,
      );
      console.error(result.stdout);
      console.error(result.stderr);
      await shutdown(1);
    }
    const killed = result.classification === "killed";
    const expected = mutant.expectKilled !== false;
    const ok = killed === expected;
    results.push({
      name: mutant.name,
      killed,
      expected,
      ok,
      classification: result.classification,
    });
    const label = killed ? "KILLED" : "SURVIVED";
    console.log(ok ? `${label}  ${mutant.name}` : `UNEXPECTED ${label}  ${mutant.name}`);
    if ((mutant.tests ?? []).includes("e2e")) {
      const failed = result.failedTitles ?? [];
      if (failed.length) {
        console.log(`  e2e failed titles (${failed.length}): ${failed.join(" | ")}`);
      }
    }
    if (!ok) {
      console.log(result.stdout);
      console.log(result.stderr);
    }
  }
} finally {
  restoreSandbox(originals);
}

const failed = results.filter((result) => !result.ok);
const killedCount = results.filter((result) => result.killed).length;
const targeted = results.filter((result) => result.expected);
const e2eNoop = results.find((result) => result.name === "e2e-noop");
console.log("");
console.log(
  `Mutants: ${killedCount}/${targeted.length} targeted killed; noop ${
    results.find((result) => result.name === "noop")?.killed ? "killed" : "survived"
  }; e2e-noop ${e2eNoop?.killed ? "killed" : "survived"}; signal-abort-check ${
    results.find((result) => result.name === "signal-abort-check")?.ok
      ? "passed"
      : "failed"
  }`,
);
if (failed.length) {
  console.error(
    `Unexpected mutant outcomes: ${failed.map((item) => item.name).join(", ")}`,
  );
  await shutdown(1);
}

cleanup();
console.log("All targeted analytics host-gate mutants behaved as expected.");
