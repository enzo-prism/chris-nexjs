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
  "/whitening": "/zoom-whitening",
  "/teeth-whitening": "/teeth-whitening-palo-alto",
  "/dental-cleaning": "/dental-cleaning-palo-alto",
  "/cavity-fillings": "/cavity-fillings-palo-alto",
  "/crowns": "/crowns-palo-alto",
  "/pediatric-dentistry": "/pediatric-dentist-palo-alto",
} as const;

const serviceSlugRedirects: Record<string, string> = {
  "preventive-dentistry": "/preventive-dentistry",
  "restorative-dentistry": "/restorative-dentistry",
  "pediatric-dentistry": "/pediatric-dentistry",
  "invisalign": "/invisalign",
  "zoom-whitening": "/zoom-whitening",
  "dental-implants": "/dental-implants",
  "dental-veneers": "/dental-veneers",
  "emergency-dental": "/emergency-dental",
} as const;

export function getLegacyRedirectPath(pathname: string): string | null {
  const normalized = normalizePathname(pathname);

  const direct = staticLegacyRedirects[normalized];
  if (direct) return direct;

  if (normalized.startsWith("/post/")) {
    const slug = normalized.slice("/post/".length);
    if (!slug) return "/blog";
    return `/blog/${slug}`;
  }

  if (normalized.startsWith("/blog/post/")) {
    const slug = normalized.slice("/blog/post/".length);
    if (!slug) return "/blog";
    return `/blog/${slug}`;
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
