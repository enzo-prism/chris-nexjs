import { normalizePathname, seoByPath } from "./seo";

export type RedirectTarget = {
  readonly from: string;
  readonly to: string;
};

const staticLegacyRedirects: Record<string, string> = {
  "/about-us": "/about",
  "/dr-christopher-wong": "/about",
  "/wong-dentist": "/about",
  "/dr-wong-dds": "/about",
  "/dr-kris-hamamoto": "/about",
  "/dr-chris-wong": "/about",
  "/our-services": "/services",
  "/general-dentistry": "/services",
  "/contact-us": "/contact",
  "/appointments": "/schedule",
  "/schedule-an-appointment": "/schedule",
  "/patient-reviews": "/testimonials",
  "/reviews": "/testimonials",
  "/emergency": "/emergency-dental",
  "/emergency-dentist-palo-alto": "/emergency-dental",
  "/implants": "/dental-implants",
  "/veneers": "/dental-veneers",
  // Retargeted 2026-10-16 when /zoom-whitening merged into the teeth-whitening
  // page, so this stays a single hop.
  "/whitening": "/teeth-whitening-palo-alto",
  "/teeth-whitening": "/teeth-whitening-palo-alto",
  "/dental-cleaning": "/dental-cleaning-palo-alto",
  "/cavity-fillings": "/cavity-fillings-palo-alto",
  "/crowns": "/crowns-palo-alto",
  // Consolidate overlapping children's-dentistry intent into one canonical.
  "/pediatric-dentist-palo-alto": "/pediatric-dentistry",
  // Consolidate near-duplicate city doorway pages into the useful location hub.
  "/dentist-los-altos": "/locations#los-altos",
  "/dentist-los-altos-hills": "/locations#los-altos-hills",
  "/dentist-sunnyvale": "/locations#sunnyvale",
  "/dentist-cupertino": "/locations#cupertino",
  "/dentist-redwood-city": "/locations#redwood-city",
  "/dentist-atherton": "/locations#atherton",
  "/dentist-redwood-shores": "/locations#redwood-shores",
  // 2026-10-16 "Rooted" redesign consolidations (exact-path matches only —
  // the invite-only /zoom-whitening/schedule child route is unaffected).
  // ZOOM! is a brand variant of the same teeth-whitening intent.
  "/zoom-whitening": "/teeth-whitening-palo-alto",
  // The resources hub and the Invisalign blog post duplicated /invisalign.
  "/invisalign/resources": "/invisalign",
  "/blog/invisalign-palo-alto": "/invisalign",
  // The veneers post repeated the /dental-veneers head term.
  "/blog/dental-veneers-palo-alto": "/dental-veneers",
  // Duplicate whitening comparison; the newer, longer post is canonical.
  "/blog/in-office-whitening-vs-take-home-trays":
    "/blog/zoom-vs-take-home-whitening-palo-alto",
  // Legacy nested location URLs that still received visits while returning 404.
  "/locations/dentist-menlo-park": "/dentist-menlo-park",
  "/locations/dentist-redwood-shores": "/locations#redwood-shores",
  // Consolidated a duplicate Invisalign-timeline post into a single canonical.
  "/blog/how-long-does-invisalign-take-palo-alto":
    "/blog/how-long-does-invisalign-take",
  "/blog/dental-implants-vs-bridges-palo-alto":
    "/blog/dental-implants-vs-bridge-palo-alto",
} as const;

const serviceSlugRedirects: Record<string, string> = {
  "preventive-dentistry": "/preventive-dentistry",
  "restorative-dentistry": "/restorative-dentistry",
  "pediatric-dentistry": "/pediatric-dentistry",
  "invisalign": "/invisalign",
  "zoom-whitening": "/teeth-whitening-palo-alto",
  "dental-implants": "/dental-implants",
  "dental-veneers": "/dental-veneers",
  "emergency-dental": "/emergency-dental",
} as const;

// Legacy `/post/<slug>` and `/blog/post/<slug>` URLs resolve through the static
// map too, so a merged or renamed post still lands in one hop instead of
// chaining /post/x -> /blog/x -> final target.
function resolveBlogSlugRedirect(slug: string): string {
  const blogPath = `/blog/${slug}`;
  return staticLegacyRedirects[blogPath] ?? blogPath;
}

export function getLegacyRedirectPath(pathname: string): string | null {
  const normalized = normalizePathname(pathname);

  const direct = staticLegacyRedirects[normalized];
  if (direct) return direct;

  if (normalized.startsWith("/post/")) {
    const slug = normalized.slice("/post/".length);
    if (!slug) return "/blog";
    return resolveBlogSlugRedirect(slug);
  }

  if (normalized.startsWith("/blog/post/")) {
    const slug = normalized.slice("/blog/post/".length);
    if (!slug) return "/blog";
    return resolveBlogSlugRedirect(slug);
  }

  if (normalized.startsWith("/services/")) {
    const slug = normalized.slice("/services/".length).replace(/\/+$/, "");
    if (!slug) return "/services";
    const mapped = serviceSlugRedirects[slug];
    if (mapped) return mapped;
    return `/services#${slug}`;
  }

  // If a trailing slash points to a known canonical path, normalize it.
  if (normalized !== pathname && seoByPath[normalized]) {
    return normalized;
  }

  return null;
}

export const legacyRedirects: RedirectTarget[] = Object.entries(staticLegacyRedirects).map(
  ([from, to]) => ({ from, to }),
);
