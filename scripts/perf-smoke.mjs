const BASE_URL = (process.env.PERF_BASE_URL || "http://localhost:3101").replace(
  /\/+$/,
  "",
);

const ROUTES = ["/", "/services", "/invisalign", "/dentist-menlo-park"];

const EXPECTED_POWERED_BY = (process.env.PERF_EXPECTED_POWERED_BY || "").toLowerCase();

function formatMs(ms) {
  return `${Math.round(ms)}ms`;
}

async function checkRoute(route) {
  const url = `${BASE_URL}${route === "/" ? "/" : route}`;
  const startedAt = performance.now();
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
    headers: {
      Accept: "text/html,*/*;q=0.8",
      "User-Agent": "chris-nextjs-perf-smoke/1.0",
    },
  });
  const durationMs = performance.now() - startedAt;

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  const poweredBy = (response.headers.get("x-powered-by") || "").toLowerCase();

  const failures = [];
  if (response.status >= 400) {
    failures.push(`status ${response.status}`);
  }
  if (!contentType.includes("text/html")) {
    failures.push(`unexpected content-type "${contentType || "missing"}"`);
  }
  if (EXPECTED_POWERED_BY && !poweredBy.includes(EXPECTED_POWERED_BY)) {
    failures.push(`unexpected x-powered-by "${poweredBy || "missing"}"`);
  }

  return {
    route,
    url,
    status: response.status,
    durationMs,
    failures,
  };
}

async function main() {
  const results = [];
  for (const route of ROUTES) {
    results.push(await checkRoute(route));
  }

  let failed = false;
  for (const result of results) {
    const base = `${result.route} -> ${result.status} (${formatMs(result.durationMs)})`;
    if (result.failures.length) {
      failed = true;
      console.error(`FAIL ${base}: ${result.failures.join(", ")}`);
      continue;
    }
    console.log(`OK   ${base}`);
  }

  if (failed) {
    console.error(
      `\nPerf smoke failed against ${BASE_URL}. Ensure the perf server is running and serving this repo.`,
    );
    process.exit(1);
  }

  console.log(`\nPerf smoke passed for ${ROUTES.length} routes at ${BASE_URL}.`);
}

main().catch((error) => {
  console.error("Perf smoke failed:", error);
  process.exit(1);
});
