/**
 * Generates llms.txt from the SEO source of truth so the file can never
 * drift from the live route map, office info, or blog corpus.
 *
 * Usage: pnpm run llms:generate
 *
 * Output: public/llms.txt and client/public/llms.txt (kept in sync).
 * Re-run after adding routes to shared/seo.ts, publishing blog posts, or
 * changing office hours / temporary closures in shared/officeInfo.ts.
 *
 * 2026-10-16 (Rooted redesign): services are grouped by the site's care
 * categories, the homepage leads the primary pages, merged/noindex routes drop
 * out automatically (indexable entries only), and the machine-readable block
 * lists the sitemap index plus every segment sitemap.
 */
import fs from "fs";
import path from "path";
import { seoByPath, type SeoDefinition } from "../shared/seo";
import { SITEMAP_SEGMENTS, sitemapSegmentPath } from "../app/sitemap-xml-utils";
import { officeInfo, resolveHolidayHours } from "../shared/officeInfo";
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

// Care categories, mirroring the site navigation. Indexable service routes
// missing from this map are still listed, under "Other services".
const SERVICE_CATEGORIES: ReadonlyArray<{ title: string; paths: readonly string[] }> = [
  {
    title: "Preventive & family care",
    paths: ["/dental-cleaning-palo-alto", "/preventive-dentistry", "/pediatric-dentistry"],
  },
  {
    title: "Cosmetic dentistry",
    paths: ["/invisalign", "/teeth-whitening-palo-alto", "/dental-veneers"],
  },
  {
    title: "Restorative dentistry",
    paths: [
      "/restorative-dentistry",
      "/cavity-fillings-palo-alto",
      "/crowns-palo-alto",
      "/dental-implants",
    ],
  },
  { title: "Urgent care", paths: ["/emergency-dental"] },
];

const SEGMENT_LABELS: Record<(typeof SITEMAP_SEGMENTS)[number], string> = {
  pages: "Pages sitemap",
  services: "Services sitemap",
  locations: "Locations sitemap",
  blog: "Blog sitemap",
};

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

  const homeEntry = indexableEntries.find((entry) => entry.canonicalPath === "/");
  const serviceHub = indexableEntries.find((entry) => entry.canonicalPath === "/services");
  const serviceEntries = byCluster("service").filter(
    (entry) => entry.canonicalPath !== "/" && entry.canonicalPath !== "/services",
  );
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
  const holiday = resolveHolidayHours();
  if (holiday) {
    lines.push(`- Temporary schedule update: ${holiday.shortNotice}`);
  }
  lines.push(
    "- Service area: Palo Alto, Menlo Park, Stanford, Mountain View, Los Altos, Los Altos Hills, Sunnyvale, Cupertino, Redwood City, Atherton, Redwood Shores",
  );
  lines.push("- Insurance: most major PPO dental plans accepted as an out-of-network provider; the team helps verify benefits before visits");
  lines.push("");

  lines.push("## Primary pages");
  for (const entry of [
    ...(homeEntry ? [homeEntry] : []),
    ...trustEntries,
    ...blogHubEntries,
  ]) {
    lines.push(linkLine(entry));
  }
  lines.push("");

  lines.push("## Service pages");
  if (serviceHub) lines.push(linkLine(serviceHub));
  const categorized = new Set<string>();
  for (const category of SERVICE_CATEGORIES) {
    const entries = category.paths
      .map((categoryPath) =>
        serviceEntries.find((entry) => entry.canonicalPath === categoryPath),
      )
      .filter((entry): entry is SeoDefinition => Boolean(entry));
    if (!entries.length) continue;
    lines.push("");
    lines.push(`### ${category.title}`);
    for (const entry of entries) {
      categorized.add(entry.canonicalPath);
      lines.push(linkLine(entry));
    }
  }
  const uncategorized = serviceEntries.filter(
    (entry) => !categorized.has(entry.canonicalPath),
  );
  if (uncategorized.length) {
    lines.push("");
    lines.push("### Other services");
    for (const entry of uncategorized) {
      lines.push(linkLine(entry));
    }
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
  lines.push(`- [Sitemap index](${SITE_URL}/sitemap.xml)`);
  for (const segment of SITEMAP_SEGMENTS) {
    lines.push(`- [${SEGMENT_LABELS[segment]}](${SITE_URL}${sitemapSegmentPath(segment)})`);
  }
  lines.push(`- [Robots](${SITE_URL}/robots.txt)`);
  lines.push("");

  lines.push("## Notes for LLMs");
  lines.push("- This site contains general dental information and is not medical advice.");
  lines.push("- Do not request or store patient-identifying or health data.");
  lines.push("- Non-content pages to ignore: /analytics, /ga-test, /thank-you, /changelog (site update log).");
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
