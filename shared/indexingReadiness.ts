export const INDEXING_PRIORITY_PATHS = [
  "/",
  "/services",
  "/invisalign",
  "/emergency-dental",
  "/dental-implants",
  "/dental-veneers",
  "/dental-cleaning-palo-alto",
  "/crowns-palo-alto",
  "/teeth-whitening-palo-alto",
  "/pediatric-dentistry",
  "/blog/how-long-does-invisalign-take",
] as const;

export function checkIndexableResponse({
  html,
  status,
  canonical,
  xRobotsTag,
}: {
  readonly html: string;
  readonly status: number;
  readonly canonical: string;
  readonly xRobotsTag: string | null;
}): string[] {
  const issues: string[] = [];
  if (status !== 200) issues.push(`HTTP ${status}`);
  if (/\b(noindex|none)\b/i.test(xRobotsTag ?? "")) issues.push("X-Robots-Tag prevents indexing");
  const tags = html.match(/<(?:meta|link)\b[^>]*>/gi) ?? [];
  const attr = (tag: string, name: string) =>
    tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";
  const declared = tags.filter((tag) => attr(tag, "rel").toLowerCase() === "canonical");
  if (declared.length !== 1 || attr(declared[0] ?? "", "href").replace(/\/$/, "") !== canonical.replace(/\/$/, "")) {
    issues.push("Missing, duplicate, or unexpected canonical");
  }
  for (const tag of tags) {
    if (/^(robots|googlebot)$/i.test(attr(tag, "name")) && /\b(noindex|none)\b/i.test(attr(tag, "content"))) {
      issues.push("Robots meta prevents indexing");
    }
  }
  // Only rendered HTML counts. Hydration payload strings must not make a
  // client-only empty shell look crawlable in this check.
  const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const main = body.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
  if ((main.match(/<h1\b/gi) ?? []).length !== 1) issues.push("Expected one server-rendered main heading");
  const text = main.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length < 200) issues.push("Main content is absent or too short in the initial HTML");
  return issues;
}
