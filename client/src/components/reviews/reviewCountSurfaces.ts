export const REVIEW_COUNT_SURFACES = [
  { id: "header", file: "client/src/components/layout/Header.tsx", variant: "utility" },
  { id: "home-hero", file: "client/src/components/home/HomeHero.tsx", variant: "chip" },
  { id: "home-sections", file: "client/src/components/home/HomeSections.tsx", variant: "heading" },
  { id: "page-hero", file: "client/src/components/ds/PageHero.tsx", variant: "chip" },
  { id: "location-page", file: "client/src/components/locations/LocationPage.tsx", variant: "chip" },
  { id: "services", file: "client/src/pages/Services.tsx", variant: "all-link" },
  { id: "about", file: "client/src/pages/About.tsx", variant: "read-link" },
  { id: "service-reviews", file: "client/src/components/ds/ServiceReviews.tsx", variant: "all-link" },
  { id: "testimonials-hero", file: "client/src/pages/Testimonials.tsx", variant: "hero" },
] as const;

export type ReviewCountSurfaceId = (typeof REVIEW_COUNT_SURFACES)[number]["id"];
export type ReviewCountVariant = (typeof REVIEW_COUNT_SURFACES)[number]["variant"];
