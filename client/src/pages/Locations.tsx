import Link from "next/link";
import { Accessibility, ArrowRight, Car, Clock, MapPin, TrainFront } from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import { CtaBand } from "@/components/ds/CtaBand";
import { FaqList } from "@/components/ds/FaqList";
import { PageHero } from "@/components/ds/PageHero";
import { ReviewCard } from "@/components/ds/Reviews";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { PeninsulaMap } from "@/components/locations/PeninsulaMap";
import { VisitCard } from "@/components/locations/VisitCard";
import { cityPages, nearbyCommunities } from "@/data/locations";
import { reviewsFor } from "@/data/serviceReviews";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildFAQSchema,
  buildLocationItemListSchema,
  type FAQEntry,
  type StructuredDataNode,
} from "@/lib/structuredData";

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Areas we serve", path: "/locations" },
];

const faqs: FAQEntry[] = [
  {
    question: "Do you accept patients from outside Palo Alto?",
    answer:
      "Yes. We welcome patients from across the Peninsula and regularly see families from Menlo Park, Stanford, Mountain View, Los Altos, Sunnyvale, and nearby communities.",
  },
  {
    question: "How do I choose the right location page?",
    answer:
      "All care takes place at our Palo Alto office. Dedicated pages cover the few communities with distinct visit-planning needs; every nearby community receives the same services.",
  },
  {
    question: "Do you offer the same services for all nearby cities?",
    answer:
      "Yes. Our Palo Alto office provides preventive care, restorative dentistry, Invisalign, cosmetic treatments, and emergency care for all nearby communities.",
  },
];

// ItemList/CollectionPage parts: the office itself plus the three city pages.
const locationParts = [
  {
    name: "Palo Alto (Primary Office)",
    path: "/",
    description: "Visit our main Palo Alto dental office for comprehensive care.",
  },
  {
    name: "Menlo Park",
    path: "/dentist-menlo-park",
    description: "Family dentistry near Menlo Park with convenient Palo Alto access.",
  },
  {
    name: "Stanford",
    path: "/dentist-stanford",
    description: "Flexible care for students, faculty, and families near campus.",
  },
  {
    name: "Mountain View",
    path: "/dentist-mountain-view",
    description: "Preventive, restorative, and Invisalign care for Mountain View families.",
  },
];

const arrivalFacts = [
  {
    icon: MapPin,
    title: "California Avenue district",
    body: "The office is on Cambridge Avenue, a short walk from California Avenue in Palo Alto.",
  },
  {
    icon: TrainFront,
    title: "Coming by Caltrain",
    body: "Caltrain’s California Avenue station serves the same district. Ask the front desk for the simplest walking route.",
  },
  {
    icon: Car,
    title: "Parking",
    body: "Nearby street and lot parking. Tell us where you’re coming from and we’ll share the best option and the easiest route when you schedule.",
  },
  {
    icon: Accessibility,
    title: "Accessibility",
    body: "Wheelchair-accessible entry, accessible parking spaces, and wide doorways and hallways.",
  },
  {
    icon: Clock,
    title: "First visit",
    body: (
      <>
        Arriving a few minutes early helps with check-in and paperwork, or fill in your{" "}
        <Link href="/patient-resources" className="link-rooted">
          new-patient forms
        </Link>{" "}
        ahead of time.
      </>
    ),
  },
] as const;

const Locations = () => {
  const structuredDataNodes: StructuredDataNode[] = [];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);
  const faqSchema = buildFAQSchema(faqs, "/locations");
  if (faqSchema) structuredDataNodes.push(faqSchema);
  const locationListSchema = buildLocationItemListSchema(locationParts);
  if (locationListSchema) structuredDataNodes.push(locationListSchema);
  const locationCollectionSchema = buildCollectionPageSchema({
    path: "/locations",
    name: "Peninsula locations served by Christopher B. Wong, DDS",
    description:
      "Location hub for Palo Alto and nearby Peninsula communities served by our dental office.",
    parts: locationParts,
  });
  if (locationCollectionSchema) structuredDataNodes.push(locationCollectionSchema);

  const parkingQuote = reviewsFor(["visit"], 1)[0];

  return (
    <>
      <StructuredData data={structuredDataNodes} />

      <PageHero
        crumbs={breadcrumbItems}
        eyebrow="Areas we serve"
        title={
          <>
            Patients we serve from around the <em>Peninsula</em>
          </>
        }
        lead="Every visit happens at one office in Palo Alto’s California Avenue district. Families come from Menlo Park, Stanford, Mountain View, Los Altos, Atherton, and towns up and down the Peninsula."
        analyticsContext="locations-hero"
        chips={["All care at one Palo Alto office", "New patients welcome"]}
        media={<PeninsulaMap className="mx-auto max-w-[34rem]" />}
      />

      {/* The three neighbors with their own pages */}
      <Section id="city-pages" tone="white" labelledBy="city-pages-title">
        <SectionHeading
          id="city-pages-title"
          eyebrow="Plan your visit"
          title={
            <>
              Three neighbors with <em>their own page</em>
            </>
          }
          lead="Menlo Park, Stanford, and Mountain View each have a page with the route to our door, scheduling notes, and answers to the questions those patients ask most."
        />
        <ul className="reveal-stagger mt-10 grid gap-4 md:grid-cols-3">
          {cityPages.map((page) => (
            <li key={page.path}>
              <Link
                href={page.path}
                className="card card-lift group flex h-full flex-col p-6 outline-none sm:p-7"
                data-analytics-context={`locations-card-${page.slug}`}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">{page.eyebrow}</span>
                </span>
                <h3 className="h-card mt-5 text-[1.6rem]">{page.city}</h3>
                <p className="mt-2 text-[15px] leading-7 text-ink-soft">{page.hub.blurb}</p>
                <p className="mt-4 flex items-start gap-2 rounded-2xl bg-cream-100 px-3.5 py-2.5 text-sm font-medium text-ink-soft">
                  <Car className="mt-0.5 h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
                  {page.hub.routeLine}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[15px] font-semibold text-evergreen-700">
                  Plan a visit from {page.city}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Directions, parking, arrival */}
      <Section id="directions" tone="cream" labelledBy="directions-title">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div>
            <SectionHeading
              id="directions-title"
              eyebrow="Directions & parking"
              title={
                <>
                  Finding <em>our door</em>
                </>
              }
              lead="Wherever you start, you end up in the same garden office. Here’s what helps on the way in."
            />
            <ul className="card mt-8 divide-y divide-cream-300/70 overflow-hidden">
              {arrivalFacts.map((fact) => {
                const Icon = fact.icon;
                return (
                  <li key={fact.title} className="flex items-start gap-4 p-5 sm:p-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-ink">{fact.title}</h3>
                      <p className="mt-1 text-[15px] leading-6 text-ink-soft">{fact.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="grid content-start gap-6">
            <VisitCard analyticsContext="locations" showNotes={false} />
            {parkingQuote ? <ReviewCard review={parkingQuote} /> : null}
          </div>
        </div>
      </Section>

      {/* Retired city pages keep a short, honest entry and a stable anchor. */}
      <Section id="nearby" tone="white" labelledBy="nearby-title">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <SectionHeading
              id="nearby-title"
              eyebrow="More of the Peninsula"
              title={
                <>
                  Also coming from <em>nearby</em>
                </>
              }
              lead="These communities don’t have separate pages because the visit is the same: you come to our Palo Alto office, and we share the easiest route and parking tips when you schedule."
            />
            <p className="prose-rooted mt-6">
              Every neighbor gets the full range of care, from{" "}
              <Link href="/dental-cleaning-palo-alto">cleanings and exams</Link> and{" "}
              <Link href="/pediatric-dentistry">children’s visits</Link> to{" "}
              <Link href="/invisalign">Invisalign</Link>,{" "}
              <Link href="/restorative-dentistry">restorative care</Link>, and{" "}
              <Link href="/emergency-dental">urgent appointments</Link>. See{" "}
              <Link href="/services">every service</Link>.
            </p>
          </div>
          <ul className="divide-y divide-cream-300/80 overflow-hidden rounded-[1.75rem] border border-cream-300/80 bg-cream-50">
            {nearbyCommunities.map((place) => (
              <li key={place.id} id={place.id} className="flex scroll-mt-32 items-start gap-4 px-5 py-5 target:bg-gold-200/30 sm:px-7">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-evergreen-500" aria-hidden="true" />
                <div>
                  <h3 className="font-heading text-[1.25rem] font-medium leading-snug text-ink">{place.name}</h3>
                  <p className="mt-1 text-[15px] leading-6 text-ink-soft">{place.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="faq" tone="cream" labelledBy="locations-faq-title">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            id="locations-faq-title"
            eyebrow="Questions"
            title={
              <>
                Areas we serve <em>FAQs</em>
              </>
            }
            lead="All care happens at our Palo Alto office, for every community."
          />
          <FaqList items={faqs} />
        </div>
      </Section>

      <CtaBand analyticsContext="locations-cta" />
    </>
  );
};

export default Locations;
