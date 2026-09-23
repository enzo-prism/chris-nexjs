// Lead-source attribution shared by the browser capture, the lead APIs, and
// analytics. Nothing here may carry patient identifiers: only a coarse
// channel, the landing path, the referring host, and campaign (utm_*) tags.
// Kept free of zod so the browser bundle stays small; the wire schema lives in
// ./attributionSchema.

export const LEAD_CHANNELS = [
  "google_business_profile",
  "google_ads",
  "google_organic",
  "other_search",
  "ai_assistant",
  "social",
  "yelp",
  "email",
  "campaign",
  "referral",
  "direct",
] as const;

export type LeadChannel = (typeof LEAD_CHANNELS)[number];

export const LEAD_CHANNEL_LABELS: Readonly<Record<LeadChannel, string>> = {
  google_business_profile: "Google Business Profile",
  google_ads: "Google Ads",
  google_organic: "Google search / Maps (untagged)",
  other_search: "Other search engine",
  ai_assistant: "AI assistant",
  social: "Social media",
  yelp: "Yelp",
  email: "Email / patient messaging",
  campaign: "Tagged campaign",
  referral: "Referral website",
  direct: "Direct / typed URL",
};

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type LeadAttribution = {
  readonly channel: LeadChannel;
  readonly landingPath?: string;
  readonly referrerHost?: string;
};

export const isLeadChannel = (value: unknown): value is LeadChannel =>
  typeof value === "string" && (LEAD_CHANNELS as readonly string[]).includes(value);

const SEARCH_HOSTS = [
  "bing.com",
  "duckduckgo.com",
  "yahoo.com",
  "search.brave.com",
  "ecosia.org",
  "baidu.com",
];
const AI_HOSTS = [
  "chatgpt.com",
  "chat.openai.com",
  "perplexity.ai",
  "copilot.microsoft.com",
  "gemini.google.com",
  "claude.ai",
];
const SOCIAL_HOSTS = [
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "lnkd.in",
  "t.co",
  "x.com",
  "twitter.com",
  "tiktok.com",
  "nextdoor.com",
  "reddit.com",
  "youtube.com",
];
const EMAIL_HOSTS = ["demandforce.com", "mail.google.com", "outlook.live.com"];

const hostMatches = (host: string, candidates: readonly string[]): boolean =>
  candidates.some(
    (candidate) => host === candidate || host.endsWith(`.${candidate}`),
  );

const isGoogleHost = (host: string): boolean =>
  /(^|\.)google\.[a-z.]+$/.test(host);

type DeriveLeadChannelInput = {
  readonly utm?: Readonly<Record<string, string | undefined>>;
  readonly referrerHost?: string | null;
  readonly hasClickId?: boolean;
};

/**
 * Classify a visit into one coarse channel. Explicit tags win over referrers:
 * the Google Business Profile links carry `utm_campaign=gbp_*` because Google
 * search, Maps, and the profile otherwise all arrive as a bare google.com
 * referrer.
 */
export function deriveLeadChannel({
  utm = {},
  referrerHost,
  hasClickId = false,
}: DeriveLeadChannelInput): LeadChannel {
  const source = utm.utm_source?.toLowerCase() ?? "";
  const medium = utm.utm_medium?.toLowerCase() ?? "";
  const campaign = utm.utm_campaign?.toLowerCase() ?? "";

  if ([source, medium, campaign].some((value) => /(^|[_-])gbp([_-]|$)/.test(value))) {
    return "google_business_profile";
  }
  if (hasClickId || /^(cpc|ppc|paid|paidsearch|paid_search)$/.test(medium)) {
    return "google_ads";
  }
  if (medium === "email" || source.includes("demandforce")) return "email";
  if (source) return "campaign";

  const host = referrerHost?.toLowerCase().replace(/^www\./, "") ?? "";
  if (!host) return "direct";
  if (hostMatches(host, AI_HOSTS)) return "ai_assistant";
  if (isGoogleHost(host)) return "google_organic";
  if (hostMatches(host, SEARCH_HOSTS)) return "other_search";
  if (hostMatches(host, SOCIAL_HOSTS)) return "social";
  if (hostMatches(host, ["yelp.com"])) return "yelp";
  if (hostMatches(host, EMAIL_HOSTS)) return "email";
  return "referral";
}

export function pickUtmParams(
  params: Readonly<Record<string, string | undefined>> | URLSearchParams,
): Record<string, string> {
  const read = (key: string): string | undefined =>
    params instanceof URLSearchParams ? params.get(key) ?? undefined : params[key];
  const values: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = read(key)?.trim();
    if (value) values[key] = value.slice(0, 100);
  }
  return values;
}

export function describeLeadAttribution(
  attribution: LeadAttribution | undefined,
): string {
  if (!attribution) return "Unknown";
  const parts = [LEAD_CHANNEL_LABELS[attribution.channel]];
  if (attribution.landingPath) parts.push(`landed on ${attribution.landingPath}`);
  if (attribution.referrerHost) parts.push(`via ${attribution.referrerHost}`);
  return parts.join(" · ");
}
