import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Phone } from "lucide-react";

import { GOOGLE_REVIEW_COUNT } from "@shared/reviewStats";
import { officeInfo } from "@/lib/data";
import StructuredData from "@/components/seo/StructuredData";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import { CtaBand } from "@/components/ds/CtaBand";
import { FaqList } from "@/components/ds/FaqList";
import { StarRow } from "@/components/ds/Reviews";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { ServiceIcon } from "@/components/ds/ServiceIcon";
import { ServiceReviews } from "@/components/ds/ServiceReviews";
import { renderInlineMarkdown } from "@/components/blog/InlineMarkdown";
import { cityPages, type LocationContent } from "@/data/locations";
import { buildBreadcrumbSchema, buildFAQSchema, type StructuredDataNode } from "@/lib/structuredData";
import { RouteCard } from "./RouteCard";
import { VisitCard } from "./VisitCard";
import { emTitle } from "./emTitle";

const LINK = "link-rooted";

/**
 * One template for the neighboring-city pages. Everything city-specific
 * (copy, route, audiences, visits, quotes, FAQs) comes from
 * client/src/data/locations.ts so the pages stay genuinely distinct.
 */
export function LocationPage({ location }: { readonly location: LocationContent }) {
  const ctx = location.slug;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Areas we serve", path: "/locations" },
    { name: location.crumb, path: location.path },
  ];

  const schemas: StructuredDataNode[] = [];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  if (breadcrumbSchema) schemas.push(breadcrumbSchema);
  const faqSchema = buildFAQSchema([...location.faqs], location.path);
  if (faqSchema) schemas.push(faqSchema);

  const neighbors = cityPages.filter((page) => page.slug !== location.slug);

  return (
    <>
      <StructuredData data={schemas} />

      {/* Hero: PageHero's layout, with a smaller phone H1 (≤32px, tests/mobile/headings.spec.ts). */}
      <section className="paper relative isolate overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8 lg:pb-20">
          <div className="relative z-10 max-w-3xl">
            <PageBreadcrumbs items={breadcrumbItems} inline className="mb-6 sm:mb-8" />
            <p className="eyebrow rise-in">{location.eyebrow}</p>
            <h1 className="h-display mt-5 text-balance text-[2rem] sm:text-[2.9rem] lg:text-[3.35rem]">
              {location.h1}
            </h1>
            <p className="lead mt-5 max-w-2xl">{location.lead}</p>
            <div className="rise-in rise-in-3 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/schedule#appointment"
                className="btn btn-primary btn-lg"
                data-analytics-context={`${ctx}-hero-request`}
              >
                <CalendarDays aria-hidden="true" />
                Request a visit
              </Link>
              <a
                href={`tel:${officeInfo.phoneE164}`}
                className="btn btn-outline btn-lg"
                data-analytics-context={`${ctx}-hero-call`}
                aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
              >
                <Phone aria-hidden="true" />
                {officeInfo.phone}
              </a>
            </div>
            <div className="rise-in rise-in-4 mt-6 flex flex-wrap items-center gap-2">
              <Link href="/testimonials" className="pill min-h-11 transition-colors hover:border-gold-400">
                <StarRow size="h-3.5 w-3.5" />
                {GOOGLE_REVIEW_COUNT} five-star Google reviews
              </Link>
              {location.chips.map((chip) => (
                <span key={chip} className="pill">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <figure className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-evergreen-900 shadow-lift">
              <Image
                src={location.heroImage.src}
                alt={location.heroImage.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover"
                style={{ objectPosition: location.heroImage.position }}
              />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-evergreen-950/55 to-transparent" />
            </div>
            <figcaption className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 sm:bottom-5 sm:left-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-cream-50/95 px-3.5 py-1.5 text-sm font-semibold text-ink shadow-soft">
                <MapPin className="h-4 w-4 text-evergreen-600" aria-hidden="true" />
                {location.heroImage.caption}
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Getting here */}
      <Section id="getting-here" tone="white" labelledBy={`${ctx}-getting-here-title`}>
        <SectionHeading
          id={`${ctx}-getting-here-title`}
          eyebrow="Getting here"
          title={emTitle(`From ${location.route.origin} to *Cambridge Ave*`)}
        />
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
          <div className="grid gap-6">
            <RouteCard route={location.route} analyticsContext={ctx} className="reveal" />
            <div className="rounded-[1.75rem] border border-gold-200 bg-cream-50 p-6 sm:p-7">
              <h3 className="h-card text-[1.3rem] sm:text-[1.45rem]">{location.planning.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-ink-soft sm:text-base">
                {renderInlineMarkdown(location.planning.body, LINK)}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/schedule#appointment"
                  className="btn btn-primary"
                  data-analytics-context={`${ctx}-planning-request`}
                >
                  <CalendarDays aria-hidden="true" />
                  Request an appointment
                </Link>
                <Link href="/insurance" className="btn btn-ghost" data-analytics-context={`${ctx}-planning-insurance`}>
                  Insurance &amp; costs
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
          <VisitCard analyticsContext={ctx} className="reveal" />
        </div>
      </Section>

      {/* City-specific story + audiences */}
      <Section tone="cream" labelledBy={`${ctx}-story-title`}>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading id={`${ctx}-story-title`} eyebrow={location.story.eyebrow} title={emTitle(location.story.title)} />
            <div className="prose-rooted mt-6 space-y-4">
              {location.story.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{renderInlineMarkdown(paragraph, LINK)}</p>
              ))}
            </div>
          </div>
          {location.audiences ? (
            <div>
              <h2 className="h-card text-[1.6rem] sm:text-[1.9rem]">{emTitle(location.audiences.title)}</h2>
              <ul className="reveal-stagger mt-6 grid gap-4 sm:grid-cols-2">
                {location.audiences.items.map((item) => (
                  <li key={item.title} className="card p-5 sm:p-6">
                    <h3 className="h-card text-[1.25rem]">{item.title}</h3>
                    <p className="mt-2 text-[15px] leading-7 text-ink-soft">{renderInlineMarkdown(item.body, LINK)}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <figure className="relative min-h-[16rem] overflow-hidden rounded-[2rem] lg:min-h-full">
              <Image
                src="/images/redesign/office-reception-waiting.webp"
                alt="Reception and waiting area with wood-slat walls and navy seating"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-[50%_45%]"
              />
            </figure>
          )}
        </div>
      </Section>

      {/* Common visits (service links) */}
      <Section tone="white" labelledBy={`${ctx}-visits-title`}>
        <SectionHeading
          id={`${ctx}-visits-title`}
          eyebrow="Care close to home"
          title={emTitle(location.visits.title)}
          lead={renderInlineMarkdown(location.visits.lead, LINK)}
        />
        <ul className="reveal-stagger mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {location.visits.items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="card card-lift group flex h-full items-start gap-4 p-4 outline-none sm:flex-col sm:p-6"
                data-analytics-context={`${ctx}-visit-${item.icon}`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700 transition-colors group-hover:bg-evergreen-800 group-hover:text-gold-300">
                  <ServiceIcon name={item.icon} className="h-7 w-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-[1.15rem] font-medium leading-snug text-ink sm:text-xl">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-[15px] leading-6 text-ink-muted">{item.description}</span>
                </span>
                <ArrowRight
                  className="mt-1 h-5 w-5 shrink-0 text-evergreen-600 transition-transform group-hover:translate-x-1 sm:mt-auto"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <ServiceReviews tags={location.reviews.tags} title={emTitle(location.reviews.title)} note={location.reviews.note} />

      <Section id="faq" tone="white" labelledBy={`${ctx}-faq-title`}>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              id={`${ctx}-faq-title`}
              eyebrow="Questions"
              title={location.faqTitle}
              lead={`Quick answers for patients coming from ${location.city}.`}
            />
            <nav aria-label="Other areas we serve" className="mt-8">
              <p className="text-sm font-semibold text-ink">Coming from somewhere else?</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {neighbors.map((page) => (
                  <li key={page.path}>
                    <Link href={page.path} className="pill min-h-11 transition-colors hover:border-evergreen-400 hover:text-evergreen-800">
                      <MapPin className="h-3.5 w-3.5 text-evergreen-500" aria-hidden="true" />
                      {page.city}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/locations" className="pill min-h-11 transition-colors hover:border-evergreen-400 hover:text-evergreen-800">
                    <MapPin className="h-3.5 w-3.5 text-evergreen-500" aria-hidden="true" />
                    All areas we serve
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <FaqList items={location.faqs} />
        </div>
      </Section>

      <CtaBand analyticsContext={`${ctx}-cta`} />
    </>
  );
}

export default LocationPage;
