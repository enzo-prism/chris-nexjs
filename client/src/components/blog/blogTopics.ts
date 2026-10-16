import type { ServiceIconName } from "@/components/ds/ServiceIcon";
import type { RelatedServiceLink } from "@/components/common/RelatedServices";
import { allServices } from "@/data/siteNav";

/**
 * Blog categories → the branded cover (tone + line icon) and the service
 * pages each topic should point readers to. One place, so the blog index,
 * article template, cards, and service-page "From the blog" bands agree.
 */
export type CoverTone = "night" | "cream" | "gold" | "sage" | "mist" | "sand";

export type BlogTopic = {
  readonly id: string;
  readonly label: string;
  readonly icon: ServiceIconName;
  readonly tone: CoverTone;
  /** The main service page for readers of this topic. */
  readonly servicePath: string;
};

const TOPICS: Readonly<Record<string, BlogTopic>> = {
  "emergency-dentistry": {
    id: "emergency-dentistry",
    label: "Emergency Dentistry",
    icon: "emergency",
    tone: "night",
    servicePath: "/emergency-dental",
  },
  "restorative-dentistry": {
    id: "restorative-dentistry",
    label: "Restorative Dentistry",
    icon: "crown",
    tone: "cream",
    servicePath: "/restorative-dentistry",
  },
  "cosmetic-dentistry": {
    id: "cosmetic-dentistry",
    label: "Cosmetic Dentistry",
    icon: "veneer",
    tone: "gold",
    servicePath: "/dental-veneers",
  },
  "teeth-whitening": {
    id: "teeth-whitening",
    label: "Teeth Whitening",
    icon: "whitening",
    tone: "gold",
    servicePath: "/teeth-whitening-palo-alto",
  },
  invisalign: {
    id: "invisalign",
    label: "Invisalign",
    icon: "aligner",
    tone: "sage",
    servicePath: "/invisalign",
  },
  "pediatric-dentistry": {
    id: "pediatric-dentistry",
    label: "Children’s Dentistry",
    icon: "kids",
    tone: "sand",
    servicePath: "/pediatric-dentistry",
  },
  "family-dentistry": {
    id: "family-dentistry",
    label: "Family Dentistry",
    icon: "brush",
    tone: "mist",
    servicePath: "/dental-cleaning-palo-alto",
  },
  "preventive-dentistry": {
    id: "preventive-dentistry",
    label: "Preventive Dentistry",
    icon: "shield",
    tone: "mist",
    servicePath: "/preventive-dentistry",
  },
};

const FALLBACK_TOPIC: BlogTopic = {
  id: "dental-health",
  label: "Dental Health",
  icon: "tooth",
  tone: "cream",
  servicePath: "/services",
};

/** "Restorative Dentistry" → "restorative-dentistry" (same as the old filter ids). */
export function normalizeCategory(category?: string | null): string {
  const label = category?.trim();
  return (label && label.length > 0 ? label : "Dental Health").toLowerCase().replace(/\s+/g, "-");
}

export function topicFor(category?: string | null): BlogTopic {
  return TOPICS[normalizeCategory(category)] ?? FALLBACK_TOPIC;
}

/* --------------------------------------------- related service links */

// Post `relatedServices` slugs (seed vocabulary) → live, non-redirecting URLs.
const SERVICE_SLUG_PATHS: Readonly<Record<string, string>> = {
  "crowns-palo-alto": "/crowns-palo-alto",
  "restorative-dentistry": "/restorative-dentistry",
  "zoom-whitening": "/teeth-whitening-palo-alto",
  "teeth-whitening-palo-alto": "/teeth-whitening-palo-alto",
  "emergency-dental": "/emergency-dental",
  "family-dentistry": "/dental-cleaning-palo-alto",
  "dental-cleaning-palo-alto": "/dental-cleaning-palo-alto",
  "dental-veneers": "/dental-veneers",
  "preventive-dentistry": "/preventive-dentistry",
  invisalign: "/invisalign",
  "pediatric-dentistry": "/pediatric-dentistry",
  "dental-implants": "/dental-implants",
  "cavity-fillings-palo-alto": "/cavity-fillings-palo-alto",
};

// What an article is actually about, read from its slug.
const SLUG_KEYWORD_PATHS: readonly (readonly [RegExp, string])[] = [
  [/implant|bridge|extraction/, "/dental-implants"],
  [/crown|root-canal/, "/crowns-palo-alto"],
  [/filling/, "/cavity-fillings-palo-alto"],
  [/whitening/, "/teeth-whitening-palo-alto"],
  [/veneer|bonding/, "/dental-veneers"],
  [/invisalign|retainer/, "/invisalign"],
  [/kids|child|sealant|mouthguard|first-dental-visit/, "/pediatric-dentistry"],
  [/bleeding-gums|food-gets-stuck|floss/, "/dental-cleaning-palo-alto"],
  [/night-guard|allerg|sensitive/, "/preventive-dentistry"],
  [/emergency|abscess|knocks-out|cracked|fell-off/, "/emergency-dental"],
  [/menlo-park/, "/dentist-menlo-park"],
];

const EXTRA_LINK_COPY: Readonly<Record<string, { label: string; blurb: string }>> = {
  "/dentist-menlo-park": {
    label: "Visiting from Menlo Park",
    blurb: "Directions and visit tips for Menlo Park families",
  },
  "/services": { label: "All dental services", blurb: "Every treatment at our Palo Alto office" },
};

function linkFor(path: string): RelatedServiceLink {
  const nav = allServices.find((item) => item.href === path);
  const extra = EXTRA_LINK_COPY[path];
  return {
    href: path,
    anchorText: nav?.label ?? extra?.label ?? "Dental services",
    description: nav?.blurb ?? extra?.blurb,
  };
}

/** Up to `limit` service pages that genuinely relate to a post. */
export function serviceLinksForPost(
  post: { readonly slug: string; readonly category?: string | null; readonly relatedServices?: readonly string[] | null },
  limit = 3,
): RelatedServiceLink[] {
  const paths: string[] = [];
  const add = (path?: string) => {
    if (path && !paths.includes(path)) paths.push(path);
  };
  for (const [pattern, path] of SLUG_KEYWORD_PATHS) {
    if (pattern.test(post.slug)) add(path);
  }
  for (const slug of post.relatedServices ?? []) add(SERVICE_SLUG_PATHS[slug.trim().toLowerCase()]);
  add(topicFor(post.category).servicePath);
  add("/services");
  return paths.slice(0, limit).map(linkFor);
}

/* ------------------------------------ service page → matching posts */

type ServiceMatch = {
  readonly aliases: readonly string[];
  readonly keywords: RegExp;
  readonly category: string;
};

// serviceSlug as passed by <RelatedServicePosts serviceSlug="…" />.
const SERVICE_MATCHES: Readonly<Record<string, ServiceMatch>> = {
  invisalign: { aliases: ["invisalign"], keywords: /invisalign|retainer|aligner/, category: "Invisalign" },
  "emergency-dental": {
    aliases: ["emergency-dental"],
    keywords: /emergency|abscess|knocks-out|cracked-tooth|fell-off/,
    category: "Emergency Dentistry",
  },
  "dental-implants": {
    aliases: ["dental-implants"],
    keywords: /implant|bridge|extraction/,
    category: "Restorative Dentistry",
  },
  "dental-veneers": {
    aliases: ["dental-veneers"],
    keywords: /veneer|bonding|chipped/,
    category: "Cosmetic Dentistry",
  },
  "teeth-whitening-palo-alto": {
    aliases: ["zoom-whitening", "teeth-whitening-palo-alto"],
    keywords: /whitening/,
    category: "Teeth Whitening",
  },
  "zoom-whitening": {
    aliases: ["zoom-whitening", "teeth-whitening-palo-alto"],
    keywords: /whitening/,
    category: "Teeth Whitening",
  },
  "preventive-dentistry": {
    aliases: ["preventive-dentistry"],
    keywords: /sealant|allerg|night-guard|mouthguard|bleeding-gums|sensitive/,
    category: "Preventive Dentistry",
  },
  "pediatric-dentistry": {
    aliases: ["pediatric-dentistry"],
    keywords: /kids|child|sealant|mouthguard|first-dental-visit/,
    category: "Pediatric Dentistry",
  },
  "dental-cleaning-palo-alto": {
    aliases: ["family-dentistry"],
    keywords: /bleeding-gums|food-gets-stuck|floss|cleaning/,
    category: "Family Dentistry",
  },
  "crowns-palo-alto": {
    aliases: ["crowns-palo-alto"],
    keywords: /crown|root-canal/,
    category: "Restorative Dentistry",
  },
  "cavity-fillings-palo-alto": {
    aliases: ["cavity-fillings-palo-alto"],
    keywords: /filling|sensitive-to-cold/,
    category: "Restorative Dentistry",
  },
  "restorative-dentistry": {
    aliases: ["restorative-dentistry"],
    keywords: /crown|filling|implant|bridge/,
    category: "Restorative Dentistry",
  },
};

/**
 * Deterministic pick of up to `limit` posts for a service page, newest first
 * within each relevance tier. Falls back to the newest posts in the service's
 * category; returns [] only when nothing at all relates.
 */
export function postsForService<T extends { slug: string; category: string; relatedServices: readonly string[] }>(
  posts: readonly T[],
  serviceSlug: string,
  category?: string,
  limit = 3,
): T[] {
  const slug = serviceSlug.trim().toLowerCase();
  const match = SERVICE_MATCHES[slug];
  const aliases = new Set([slug, ...(match?.aliases ?? [])]);
  const wantedCategory = normalizeCategory(category ?? match?.category ?? null);
  const hasCategory = Boolean(category ?? match?.category);

  const scored = posts
    .map((post, index) => {
      let score = 0;
      if (match?.keywords.test(post.slug)) score += 3;
      if (post.relatedServices.some((s) => aliases.has(s.trim().toLowerCase()))) score += 2;
      if (hasCategory && normalizeCategory(post.category) === wantedCategory) score += category ? 3 : 1;
      return { post, index, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.post);

  const picked = scored.slice(0, limit);
  if (picked.length < limit && hasCategory) {
    for (const post of posts) {
      if (picked.length >= limit) break;
      if (!picked.includes(post) && normalizeCategory(post.category) === wantedCategory) picked.push(post);
    }
  }
  return picked;
}
