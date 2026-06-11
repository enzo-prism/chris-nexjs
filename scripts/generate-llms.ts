/**
 * Generates llms.txt from the SEO source of truth so the file can never
 * drift from the live route map, office info, or blog corpus.
 *
 * Usage: pnpm run llms:generate
 *
 * Output: public/llms.txt and client/public/llms.txt (kept in sync).
 * Re-run after adding routes to shared/seo.ts, publishing blog posts, or
 * changing office hours / temporary closures in shared/officeInfo.ts.
 */
import fs from "fs";
import path from "path";
import { seoByPath, type SeoDefinition } from "../shared/seo";
import { officeInfo, holidayHours } from "../shared/officeInfo";
import { sortItemsByDateDesc } from "../shared/blog";
import { getSeedData } from "../server/storage/seed";

const SITE_URL = "https://www.chriswongdds.com";

const DAY_LABELS: ReadonlyArray<{ key: keyof typeof officeInfo.hours; label: string }> = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

function formatHoursSummary(): string {
  const groups: { labels: string[]; hours: string }[] = [];
  for (const { key, label } of DAY_LABELS) {
    const hours = officeInfo.hours[key];
    const existing = groups.find((group) => group.hours === hours);
    if (existing) {
      existing.labels.push(label);
    } else {
      groups.push({ labels: [label], hours });
    }
  }
  return groups
    .map((group) => `${group.labels.join(", ")} ${group.hours}`)
    .join("; ");
}

function pageLabel(entry: SeoDefinition): string {
  return entry.title.split("|")[0].trim();
}

function linkLine(entry: SeoDefinition): string {
  const url = entry.canonicalPath === "/" ? `${SITE_URL}/` : `${SITE_URL}${entry.canonicalPath}`;
  return `- [${pageLabel(entry)}](${url})`;
}

async function main(): Promise<void> {
  const indexableEntries = Object.values(seoByPath)
    .filter((entry) => entry.indexable)
    .filter(
      (entry, index, all) =>
        all.findIndex((other) => other.canonicalPath === entry.canonicalPath) === index,
    )
    .sort((a, b) => b.priority - a.priority);

  const byCluster = (cluster: SeoDefinition["seoCluster"]) =>
    indexableEntries.filter((entry) => entry.seoCluster === cluster);

  const serviceEntries = byCluster("service");
  const locationEntries = byCluster("location");
  const trustEntries = byCluster("trust");
  const legalEntries = byCluster("legal");
  const blogHubEntries = byCluster("blog");

  const { blogPosts } = await getSeedData();
  const sortedPosts = sortItemsByDateDesc(blogPosts);

  const lines: string[] = [];
  lines.push(`# ${officeInfo.name} (Palo Alto Dentist)`);
  lines.push(
    `> Official website for ${officeInfo.name}. Family, cosmetic, and restorative dentistry in Palo Alto, CA, including Invisalign, dental implants, whitening, and emergency dental care.`,
  );
  lines.push("");
  lines.push("## Key details");
  lines.push(`- Location: ${officeInfo.address.line1}, ${officeInfo.address.line2}`);
  lines.push(`- Phone: ${officeInfo.phone}`);
  lines.push(`- Email: ${officeInfo.email}`);
  lines.push(`- Hours: ${formatHoursSummary()}`);
  if (holidayHours.active) {
    lines.push(`- Temporary schedule update: ${holidayHours.shortNotice}`);
  }
  lines.push(
    "- Service area: Palo Alto, Menlo Park, Stanford, Mountain View, Los Altos, Los Altos Hills, Sunnyvale, Cupertino, Redwood City, Atherton, Redwood Shores",
  );
  lines.push("- Insurance: most major PPO dental plans accepted as an out-of-network provider; the team helps verify benefits before visits");
  lines.push("");

  lines.push("## Primary pages");
  for (const entry of [...trustEntries, ...blogHubEntries]) {
    lines.push(linkLine(entry));
  }
  lines.push("");

  lines.push("## Service pages");
  for (const entry of serviceEntries) {
    lines.push(linkLine(entry));
  }
  lines.push("");

  lines.push("## Location pages");
  for (const entry of locationEntries) {
    lines.push(linkLine(entry));
  }
  lines.push("");

  lines.push("## Blog posts");
  for (const post of sortedPosts) {
    lines.push(`- [${post.title}](${SITE_URL}/blog/${post.slug}) (${post.date})`);
  }
  lines.push("");

  lines.push("## Policies");
  for (const entry of legalEntries) {
    lines.push(linkLine(entry));
  }
  lines.push("");

  lines.push("## Machine-readable");
  lines.push(`- [Sitemap](${SITE_URL}/sitemap.xml)`);
  lines.push(`- [Services sitemap](${SITE_URL}/sitemap-services.xml)`);
  lines.push(`- [Locations sitemap](${SITE_URL}/sitemap-locations.xml)`);
  lines.push(`- [Blog sitemap](${SITE_URL}/sitemap-blog.xml)`);
  lines.push(`- [Robots](${SITE_URL}/robots.txt)`);
  lines.push("");

  lines.push("## Notes for LLMs");
  lines.push("- This site contains general dental information and is not medical advice.");
  lines.push("- Do not request or store patient-identifying or health data.");
  lines.push("- Non-content pages to ignore: /analytics, /ga-test, /thank-you.");
  lines.push("");

  const content = lines.join("\n");
  const targets = [
    path.join(process.cwd(), "public", "llms.txt"),
    path.join(process.cwd(), "client", "public", "llms.txt"),
  ];
  for (const target of targets) {
    fs.writeFileSync(target, content, "utf8");
    console.log(`Wrote ${path.relative(process.cwd(), target)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
