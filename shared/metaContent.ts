import {
  seoByPath,
  getSeoForPath,
  normalizePathname,
  buildExcerpt,
  type SeoDefinition,
} from "./seo";

export type MetaDefinition = Pick<SeoDefinition, "title" | "description">;

export const pageTitles = {
  home: seoByPath["/"].title,
  about: seoByPath["/about"].title,
  services: seoByPath["/services"].title,
  patientResources: seoByPath["/patient-resources"].title,
  testimonials: seoByPath["/testimonials"].title,
  patientStories: seoByPath["/patient-stories"].title,
  blog: seoByPath["/blog"].title,
  contact: seoByPath["/contact"].title,
  schedule: seoByPath["/schedule"].title,
  invisalign: seoByPath["/invisalign"].title,
  invisalignResources: seoByPath["/invisalign/resources"].title,
  emergencyDental: seoByPath["/emergency-dental"].title,
  zoomWhitening: seoByPath["/zoom-whitening"].title,
  dentalImplants: seoByPath["/dental-implants"].title,
  analytics: seoByPath["/analytics"].title,
  notFound: "Page Not Found | Christopher B. Wong, DDS",
  default: seoByPath["/"].title,
} as const;

export const pageDescriptions = {
  home: seoByPath["/"].description,
  about: seoByPath["/about"].description,
  services: seoByPath["/services"].description,
  patientResources: seoByPath["/patient-resources"].description,
  testimonials: seoByPath["/testimonials"].description,
  patientStories: seoByPath["/patient-stories"].description,
  blog: seoByPath["/blog"].description,
  contact: seoByPath["/contact"].description,
  schedule: seoByPath["/schedule"].description,
  invisalign: seoByPath["/invisalign"].description,
  invisalignResources: seoByPath["/invisalign/resources"].description,
  emergencyDental: seoByPath["/emergency-dental"].description,
  zoomWhitening: seoByPath["/zoom-whitening"].description,
  dentalImplants: seoByPath["/dental-implants"].description,
  analytics: seoByPath["/analytics"].description,
  notFound:
    "Page not found. Return to Dr. Wong's Palo Alto dental practice homepage or contact our office for assistance with dental appointments.",
  default: seoByPath["/"].description,
  dentalVeneers: seoByPath["/dental-veneers"].description,
  accessibility: seoByPath["/accessibility"].description,
  hipaa: seoByPath["/hipaa"].description,
  privacyPolicy: seoByPath["/privacy-policy"].description,
  terms: seoByPath["/terms"].description,
  thankYou: seoByPath["/thank-you"].description,
  gaTest: seoByPath["/ga-test"].description,
} as const;

export function getMetaForPath(pathname: string): MetaDefinition {
  const { title, description } = getSeoForPath(pathname);
  return { title, description };
}

export { seoByPath, getSeoForPath, normalizePathname, buildExcerpt };
