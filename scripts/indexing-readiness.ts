import { INDEXING_PRIORITY_PATHS, checkIndexableResponse } from "../shared/indexingReadiness";

const base = new URL(process.env.SEO_AUDIT_BASE_URL || "http://localhost:3000");
if (base.username || base.password || !["http:", "https:"].includes(base.protocol)) {
  throw new Error("Use a plain HTTP(S) audit origin without credentials");
}
const agents = [
  ["Googlebot", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"],
  ["Google-InspectionTool", "Mozilla/5.0 (compatible; Google-InspectionTool/1.0;)"],
  ["OAI-SearchBot", "Mozilla/5.0 (compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot)"],
] as const;
const csv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

async function main(): Promise<void> {
  let failures = 0;
  console.log("checked_at,url,user_agent,http_status,fetch_readiness,issues,google_index_status");
  for (const path of INDEXING_PRIORITY_PATHS) {
    for (const [agent, userAgent] of agents) {
      const url = new URL(path, base);
      try {
        const response = await fetch(url, {
          redirect: "manual",
          headers: { "User-Agent": userAgent, Accept: "text/html" },
          signal: AbortSignal.timeout(20_000),
        });
        const issues = checkIndexableResponse({
          html: await response.text(),
          status: response.status,
          canonical: `https://www.chriswongdds.com${path}`,
          xRobotsTag: response.headers.get("x-robots-tag"),
        });
        if (issues.length) failures += 1;
        console.log([new Date().toISOString(), url.toString(), agent, response.status,
          issues.length ? "FAIL" : "PASS", issues.join("; "), "NOT_CHECKED"].map(csv).join(","));
      } catch (error) {
        failures += 1;
        // Do not print the origin or request headers in exception objects.
        console.log([new Date().toISOString(), url.toString(), agent, "", "FAIL",
          error instanceof Error ? error.name : "Fetch failed", "NOT_CHECKED"].map(csv).join(","));
      }
    }
  }
  console.error("Fetch readiness is not Google indexing, verified crawler identity, or firewall-log proof. Confirm index status separately in Search Console.");
  if (failures) process.exitCode = 1;
}

main().catch(() => { console.error("Indexing-readiness audit failed"); process.exitCode = 1; });
