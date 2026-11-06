/** Primary patient resources, checked November 6, 2026.
 * These are further reading, not evidence of a new clinical review by Dr. Wong.
 */
export type ClinicalResource = {
  readonly title: string;
  readonly publisher: string;
  readonly url: string;
};

export const clinicalResources = {
  emergencies: {
    title: "Dental emergencies",
    publisher: "American Dental Association · MouthHealthy",
    url: "https://www.mouthhealthy.org/all-topics-a-z/dental-emergencies",
  },
  implants: {
    title: "Dental implants and the stages of treatment",
    publisher: "American Dental Association · MouthHealthy",
    url: "https://www.mouthhealthy.org/all-topics-a-z/implants",
  },
  invisalignProcess: {
    title: "How Invisalign treatment works",
    publisher: "Align Technology · Invisalign",
    url: "https://www.invisalign.com/how-it-works",
  },
  invisalignCost: {
    title: "How Invisalign fees and insurance coverage are determined",
    publisher: "Align Technology · Invisalign",
    url: "https://www.invisalign.com/invisalign-cost",
  },
} as const satisfies Readonly<Record<string, ClinicalResource>>;

// Only these articles receive new, relevant source links in this release.
// Do not infer an author/reviewer or reset the original publication date.
const articleResources: Readonly<Record<string, readonly ClinicalResource[]>> = {
  "how-long-does-invisalign-take": [clinicalResources.invisalignProcess],
  "invisalign-attachments-and-refinements": [clinicalResources.invisalignProcess],
  "emergency-dental-care-palo-alto": [clinicalResources.emergencies],
  "cracked-tooth-emergency-dentist-palo-alto": [clinicalResources.emergencies],
  "what-to-do-if-your-child-knocks-out-a-permanent-tooth-palo-alto": [clinicalResources.emergencies],
  "dental-implant-after-extraction-palo-alto": [clinicalResources.implants],
  "dental-implants-vs-bridge-palo-alto": [clinicalResources.implants],
};

export function resourcesForArticle(slug: string): readonly ClinicalResource[] {
  return articleResources[slug] ?? [];
}

/** Actual editorial update (adding sources), separate from clinical review. */
export function articleUpdatedDate(slug: string, publishedDate: string): string {
  if (!resourcesForArticle(slug).length) return publishedDate;
  const updated = "2026-11-06";
  const publishedTime = Date.parse(publishedDate);
  return Number.isFinite(publishedTime) && publishedTime <= Date.parse(updated)
    ? updated
    : publishedDate;
}
