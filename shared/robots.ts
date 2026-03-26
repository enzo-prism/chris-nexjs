export const CANONICAL_HOST = "www.chriswongdds.com";
export const GOOGLE_CRAWLER_USER_AGENTS = [
  "Googlebot",
  "Google-InspectionTool",
] as const;
export const BLOCKED_BOT_USER_AGENTS = [
  "AhrefsBot",
  "MJ12bot",
  "DotBot",
] as const;

export function getPublicRobotsDisallowPaths(): string[] {
  // Keep public noindex pages crawlable so Google can read their noindex tags.
  // Only block utility routes that should never be crawled or indexed.
  return ["/api/"];
}

type RobotsRule = {
  readonly userAgent: string;
  readonly allow?: string;
  readonly disallow: string | string[];
};

export function getRobotsRules(): RobotsRule[] {
  const disallow = getPublicRobotsDisallowPaths();

  return [
    ...GOOGLE_CRAWLER_USER_AGENTS.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow,
    })),
    {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    ...BLOCKED_BOT_USER_AGENTS.map((userAgent) => ({
      userAgent,
      disallow: "/",
    })),
  ];
}

export function buildRobotsTxtContent(): string {
  const lines: string[] = [];

  for (const rule of getRobotsRules()) {
    lines.push(`User-agent: ${rule.userAgent}`);

    if (rule.allow) {
      lines.push(`Allow: ${rule.allow}`);
    }

    const disallowValues = Array.isArray(rule.disallow)
      ? rule.disallow
      : [rule.disallow];

    for (const value of disallowValues) {
      lines.push(`Disallow: ${value}`);
    }

    lines.push("");
  }

  lines.push(`Sitemap: https://${CANONICAL_HOST}/sitemap.xml`);

  return `${lines.join("\n").trimEnd()}\n`;
}
