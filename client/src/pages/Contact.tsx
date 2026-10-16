"use client";

import dynamic from "next/dynamic";
// next/link, not wouter: this page renders on the dedicated /contact route,
// where there is no wouter <Switch> — a wouter Link updates the URL but never
// swaps the page content.
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  type LucideIcon,
} from "lucide-react";

import OfficeVisitSection from "@/components/sections/OfficeVisitSection";
import InsuranceInfoSection from "@/components/sections/InsuranceInfoSection";
import HolidayHoursNotice from "@/components/common/HolidayHoursNotice";
import StructuredData from "@/components/seo/StructuredData";
import { PageHero } from "@/components/ds/PageHero";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { CtaBand } from "@/components/ds/CtaBand";
import { officeInfo } from "@/lib/data";
import { getSeoForPath } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { useHolidayNotice } from "@/components/patients/useHolidayNotice";
import {
  buildBreadcrumbSchema,
  type StructuredDataNode,
  absoluteUrl,
} from "@/lib/structuredData";

const ContactForm = dynamic(() => import("@/components/forms/ContactForm"), {
  ssr: false,
  loading: () => (
    <div
      className="h-[38rem] animate-pulse rounded-[1.25rem] bg-cream-100"
      role="status"
      aria-label="Loading contact form"
    />
  ),
});

type ContactTile = {
  readonly key: string;
  readonly icon: LucideIcon;
  readonly label: string;
  readonly detail: string;
  readonly note: string;
  readonly action: string;
  readonly href: string;
  readonly external?: boolean;
  readonly primary?: boolean;
  readonly breakDetail?: boolean;
};

// The four ways to reach the office. Labels are pinned by
// tests/mobile/cta-flows.spec.ts ("call the office", "email the practice",
// "visit the office") and scripts/contact-form-ux.test.ts.
const contactTiles: readonly ContactTile[] = [
  {
    key: "request",
    icon: CalendarDays,
    label: "Request an appointment",
    detail: "Online, in about a minute",
    note: "We call or email within one business day to confirm a time.",
    action: "Start a request",
    href: "/schedule#appointment",
    primary: true,
  },
  {
    key: "call",
    icon: Phone,
    label: "Call the office",
    detail: officeInfo.phone,
    note: "Best for urgent questions or same-week availability checks.",
    action: "Call now",
    href: `tel:${officeInfo.phoneE164}`,
  },
  {
    key: "email",
    icon: Mail,
    label: "Email the practice",
    detail: officeInfo.email,
    note: "For general office questions only. Please do not email private health details.",
    action: "Start an email",
    href: `mailto:${officeInfo.email}`,
    breakDetail: true,
  },
  {
    key: "visit",
    icon: MapPin,
    label: "Visit the office",
    detail: officeInfo.address.line1,
    note: `${officeInfo.address.city}, ${officeInfo.address.region} ${officeInfo.address.postalCode}`,
    action: "Open in Maps",
    href: officeInfo.mapUrl,
    external: true,
  },
];

const nearbyLinks = [
  { href: "/dentist-menlo-park", label: "Menlo Park family dentist" },
  { href: "/dentist-stanford", label: "Stanford dentist" },
  { href: "/dentist-mountain-view", label: "Mountain View family dentist" },
  { href: "/locations", label: "All nearby communities" },
] as const;

const careLinks = [
  { href: "/dental-cleaning-palo-alto", label: "Dental cleanings in Palo Alto" },
  { href: "/pediatric-dentistry", label: "Pediatric dentist in Palo Alto" },
  { href: "/teeth-whitening-palo-alto", label: "Teeth whitening in Palo Alto" },
  { href: "/emergency-dental", label: "Emergency dentist in Palo Alto" },
] as const;

function ContactTileLink({ tile }: { readonly tile: ContactTile }) {
  const Icon = tile.icon;
  const className = cn(
    "group relative flex h-full items-start gap-4 rounded-[1.5rem] p-4 outline-none transition-[transform,box-shadow,border-color,background-color] duration-300 hover:-translate-y-0.5 focus-visible:shadow-[var(--ui-focus-shadow)] sm:flex-col sm:gap-5 sm:p-6 lg:flex-row lg:items-center lg:gap-5 lg:px-6 lg:py-5",
    tile.primary
      ? "bg-evergreen-800 text-cream-50 shadow-lift hover:bg-evergreen-700"
      : "border border-cream-300/80 bg-white text-ink shadow-soft hover:border-evergreen-200 hover:shadow-lift",
  );
  const body = (
    <>
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300",
          tile.primary
            ? "bg-white/10 text-gold-300"
            : "bg-evergreen-50 text-evergreen-700 group-hover:bg-evergreen-800 group-hover:text-gold-300",
        )}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-xs font-bold uppercase tracking-[0.14em]",
            tile.primary ? "text-mint-300" : "text-ink-muted",
          )}
        >
          {tile.label}
        </span>
        <span
          className={cn(
            "mt-1 block font-heading text-[1.3rem] font-medium leading-snug sm:text-[1.45rem] lg:text-[1.35rem]",
            tile.breakDetail && "break-all text-[1.15rem] sm:text-[1.2rem] lg:break-normal lg:text-[1.25rem]",
          )}
        >
          {tile.detail}
        </span>
        <span
          className={cn(
            "mt-1 block text-sm leading-6 lg:mt-0.5",
            tile.primary ? "text-evergreen-100/90" : "text-ink-muted",
          )}
        >
          {tile.note}
        </span>
        <span
          className={cn(
            "mt-4 hidden items-center gap-1.5 text-sm font-semibold sm:inline-flex lg:hidden",
            tile.primary ? "text-gold-300" : "text-evergreen-700",
          )}
        >
          {tile.action}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </span>
      <ArrowRight
        className={cn(
          "mt-3.5 h-5 w-5 shrink-0 sm:hidden",
          tile.primary ? "text-gold-300" : "text-evergreen-600",
        )}
        aria-hidden="true"
      />
      <span
        aria-hidden="true"
        className={cn(
          "hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors lg:inline-flex",
          tile.primary
            ? "bg-gold-400 text-evergreen-950 group-hover:bg-gold-300"
            : "bg-evergreen-50 text-evergreen-800 group-hover:bg-evergreen-800 group-hover:text-cream-50",
        )}
      >
        {tile.action}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </>
  );

  if (tile.href.startsWith("/")) {
    return (
      <Link href={tile.href} className={className} data-analytics-context={`contact-tile-${tile.key}`}>
        {body}
      </Link>
    );
  }
  return (
    <a
      href={tile.href}
      className={className}
      data-analytics-context={`contact-tile-${tile.key}`}
      {...(tile.external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
    >
      {body}
      {tile.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}

const Contact = () => {
  const holiday = useHolidayNotice();
  const seo = getSeoForPath("/contact");
  const contactPageSchema: StructuredDataNode = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl("/contact")}#webpage`,
    name: "Contact Our Palo Alto Dental Office",
    url: absoluteUrl("/contact"),
    description: seo.description,
    about: {
      "@id": `${absoluteUrl("/")}#organization`,
    },
  };
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ];
  const contactBreadcrumbs = buildBreadcrumbSchema(breadcrumbItems);
  const contactSchemas: StructuredDataNode[] = [contactPageSchema];
  if (contactBreadcrumbs) {
    contactSchemas.push(contactBreadcrumbs);
  }

  return (
    <>
      <StructuredData data={contactSchemas} />

      <PageHero
        crumbs={breadcrumbItems}
        eyebrow="Contact"
        title={<>Contact Dr. Wong&apos;s Palo Alto dental office</>}
        lead="Request an appointment, send a general question, or choose the fastest way to reach our team. For urgent dental needs, please call the office."
        actions={null}
        showReviews={false}
        media={
          <ul aria-label="Ways to reach the office" className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-1 lg:gap-3">
            {contactTiles.map((tile) => (
              <li key={tile.key}>
                <ContactTileLink tile={tile} />
              </li>
            ))}
          </ul>
        }
      >
        <p className="mt-5 text-[15px] text-ink-soft">
          <a href="#message" className="link-rooted inline-flex min-h-11 items-center gap-2">
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            Send a general question
          </a>
        </p>
      </PageHero>

      {holiday ? (
        <Section tone="white" spacing="tight" width="narrow" label="Schedule update">
          <HolidayHoursNotice variant="card" />
        </Section>
      ) : null}

      <OfficeVisitSection analyticsContext="contact-visit" />

      <Section id="message" tone="cream" labelledBy="message-heading">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:gap-8">
          <div className="card p-5 sm:p-8">
            <p className="eyebrow">General questions</p>
            <h2 id="message-heading" className="h-section mt-3 text-[1.9rem] sm:text-[2.3rem]">
              Send a <em className="whitespace-nowrap">non-urgent</em> question
            </h2>
            <p className="mb-6 mt-3 text-[15px] leading-7 text-ink-soft">
              Use this form for insurance, billing, records, referral, or general service questions.
              Please do not include medical details or urgent symptoms.
            </p>
            <ContactForm />
          </div>

          <aside className="surface-evergreen on-dark relative self-start overflow-hidden rounded-[1.75rem] p-6 shadow-lift sm:p-8 lg:sticky lg:top-[calc(var(--header-height,76px)+1.5rem)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[url('/brand/roots-glow.svg')] bg-[length:900px_225px] bg-[position:center_-20px] bg-no-repeat opacity-[0.18]"
            />
            <div className="relative">
              <h2 className="h-card text-[1.7rem] sm:text-[1.9rem]">Ready to request an appointment?</h2>
              <p className="mt-3 text-[15px] leading-7 text-evergreen-100">
                The appointment form asks only for the details our scheduling team needs to follow up and
                confirm a time.
              </p>
              <Link
                href="/schedule#appointment"
                className="btn btn-gold mt-6 w-full"
                data-analytics-context="contact-aside-request"
              >
                Request an appointment
                <ArrowRight aria-hidden="true" />
              </Link>
              <div className="mt-6 border-t border-white/15 pt-5">
                <p className="text-sm leading-6 text-evergreen-100">In pain or dealing with a dental emergency?</p>
                <a
                  href={`tel:${officeInfo.phoneE164}`}
                  className="btn btn-outline-light mt-3 w-full"
                  data-analytics-context="contact-aside-call"
                >
                  <PhoneCall aria-hidden="true" />
                  Call {officeInfo.phone}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      <InsuranceInfoSection />

      <Section tone="white" labelledBy="nearby-title">
        <SectionHeading
          id="nearby-title"
          eyebrow="Nearby"
          title={
            <>
              Serving Palo Alto and nearby <em>Peninsula communities</em>
            </>
          }
          lead="Our Palo Alto dental office welcomes patients from surrounding neighborhoods and cities. Find the right visit for your location and care goals below."
        />
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {[
            { heading: "By community", items: nearbyLinks },
            { heading: "Popular visits", items: careLinks },
          ].map((group) => (
            <div key={group.heading}>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">{group.heading}</h3>
              <ul className="mt-3 divide-y divide-cream-300/80 rounded-[1.5rem] border border-cream-300/80 bg-white">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex min-h-14 items-center justify-between gap-4 px-5 py-3 font-medium text-ink transition-colors hover:text-evergreen-800"
                    >
                      <span>{item.label}</span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-evergreen-600 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* The aside above already walks through the request steps. */}
      <CtaBand analyticsContext="contact-cta" showSteps={false} />
    </>
  );
};

export default Contact;
