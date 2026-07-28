"use client";

import { ArrowRight, CalendarDays, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import dynamic from "next/dynamic";
import OfficeVisitSection from "@/components/sections/OfficeVisitSection";
import InsuranceInfoSection from "@/components/sections/InsuranceInfoSection";
import MetaTags from "@/components/common/MetaTags";
import { pageTitles, pageDescriptions } from "@/lib/metaContent";
import HolidayHoursNotice from "@/components/common/HolidayHoursNotice";
import StructuredData from "@/components/seo/StructuredData";
import { FeatureIcon } from "@/components/common/FeatureIcon";
import { officeInfo } from "@/lib/data";
import { useHolidayHours } from "@/hooks/useHolidayHours";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
// next/link, not wouter: this page renders on the dedicated /contact route,
// where there is no wouter <Switch> — a wouter Link updates the URL but never
// swaps the page content.
import Link from "next/link";
import {
  buildBreadcrumbSchema,
  type StructuredDataNode,
  absoluteUrl,
} from "@/lib/structuredData";

const ContactForm = dynamic(() => import("@/components/forms/ContactForm"), {
  ssr: false,
  loading: () => (
    <div
      className="h-96 animate-pulse rounded-2xl bg-slate-100"
      role="status"
      aria-label="Loading contact form"
    />
  ),
});

const Contact = () => {
  const holiday = useHolidayHours();
  const contactPageSchema: StructuredDataNode = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl("/contact")}#webpage`,
    name: "Contact Our Palo Alto Dental Office",
    url: absoluteUrl("/contact"),
    description: pageDescriptions.contact,
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
      <MetaTags 
        title={pageTitles.contact}
        description={pageDescriptions.contact}
      />
      <StructuredData data={contactSchemas} />
      <PageBreadcrumbs items={breadcrumbItems} />
      {/* Hero Section */}
      <section className="bg-[#F5F9FC] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-[#333333] mb-6">
              Contact Dr. Wong&apos;s Palo Alto dental office
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-8 text-[#333333] sm:text-xl">
              Request an appointment, send a general question, or choose the fastest way to
              reach our team. For urgent dental needs, please call the office.
            </p>
            <div className="mx-auto mt-8 flex max-w-xl flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/schedule#appointment"
                className="ui-btn-primary ui-focus-premium inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 py-3 font-semibold sm:w-auto"
              >
                <CalendarDays className="mr-2 h-5 w-5" aria-hidden="true" />
                Request an appointment
              </Link>
              <a
                href="#message"
                className="ui-btn-outline ui-focus-premium inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 py-3 font-semibold sm:w-auto"
              >
                <MessageSquare className="mr-2 h-5 w-5" aria-hidden="true" />
                Send a general question
              </a>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <a
                href={`tel:${officeInfo.phoneE164}`}
                className="ui-focus-premium rounded-3xl border border-slate-200 bg-white px-6 py-5 text-left shadow-[0_20px_50px_-40px_rgba(15,23,42,0.32)] transition-transform hover:-translate-y-0.5 hover:border-primary/30"
              >
                <FeatureIcon icon={Phone} size="md" />
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Call the office
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{officeInfo.phone}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Best for urgent questions or same-week availability checks.
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                  Call now
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </span>
              </a>

              <a
                href={`mailto:${officeInfo.email}`}
                className="ui-focus-premium rounded-3xl border border-slate-200 bg-white px-6 py-5 text-left shadow-[0_20px_50px_-40px_rgba(15,23,42,0.32)] transition-transform hover:-translate-y-0.5 hover:border-primary/30"
              >
                <FeatureIcon icon={Mail} size="md" tone="emerald" />
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Email the practice
                </p>
                <p className="mt-2 break-all text-lg font-semibold text-slate-900">
                  {officeInfo.email}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  For general office questions only. Please do not email private health details.
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                  Start an email
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </span>
              </a>

              <a
                href={officeInfo.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ui-focus-premium rounded-3xl border border-slate-200 bg-white px-6 py-5 text-left shadow-[0_20px_50px_-40px_rgba(15,23,42,0.32)] transition-transform hover:-translate-y-0.5 hover:border-primary/30"
              >
                <FeatureIcon icon={MapPin} size="md" tone="amber" />
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Visit the office
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {officeInfo.address.line1}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {officeInfo.address.city}, {officeInfo.address.region} {officeInfo.address.postalCode}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                  Open in Maps
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {holiday && (
        <section className="bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <HolidayHoursNotice variant="card" />
          </div>
        </section>
      )}

      <section id="message" className="bg-white py-12 md:py-16" aria-labelledby="message-heading">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              General questions
            </p>
            <h2 id="message-heading" className="mt-2 font-heading text-2xl font-bold text-slate-900">
              Send a non-urgent question
            </h2>
            <p className="mb-6 mt-2 text-sm leading-6 text-slate-600">
              Use this form for insurance, billing, records, referral, or
              general service questions. Please do not include medical details
              or urgent symptoms.
            </p>
            <ContactForm />
          </div>
          <aside className="rounded-3xl bg-primary p-6 text-white sm:p-8">
            <h2 className="font-heading text-2xl font-bold">
              Ready to request an appointment?
            </h2>
            <p className="mt-3 leading-7 text-blue-50">
              The appointment form asks only for the details our scheduling
              team needs to follow up and confirm a time.
            </p>
            <Link
              href="/schedule#appointment"
              className="ui-focus-premium mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-5 py-3 text-center font-semibold text-primary hover:bg-blue-50 sm:w-auto"
            >
              Request an appointment
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="mt-6 border-t border-white/20 pt-5">
              <p className="text-sm leading-6 text-blue-100">
                In pain or dealing with a dental emergency?
              </p>
              <a
                href={`tel:${officeInfo.phoneE164}`}
                className="ui-focus-premium mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/35 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-white/10 sm:w-auto"
              >
                <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
                Call {officeInfo.phone}
              </a>
            </div>
          </aside>
        </div>
      </section>

      <OfficeVisitSection
        imageSrc="/images/office/atrium-courtyard.webp"
        imageAlt="Reception desk at Dr. Wong's Palo Alto dental office"
        showDirectionsButton
        withSchema
        schemaUrl="https://www.chriswongdds.com/contact"
        schemaName="Christopher B. Wong, DDS"
        schemaImage="https://www.chriswongdds.com/images/og/dr_wong_polaroids.jpg"
      />

      <section className="py-12 bg-[#F5F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#333333] mb-3">
              Serving Palo Alto and Nearby Peninsula Communities
            </h2>
            <p className="text-[#333333] max-w-3xl mx-auto">
              Our Palo Alto dental office welcomes patients from surrounding neighborhoods and cities. Find
              the right visit for your location and care goals below.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
                { href: "/dentist-menlo-park", label: "Menlo Park family dentist" },
                { href: "/dentist-stanford", label: "Stanford dentist" },
                { href: "/dentist-mountain-view", label: "Mountain View family dentist" },
                { href: "/locations", label: "All nearby communities" },
              { href: "/dental-cleaning-palo-alto", label: "Dental cleanings in Palo Alto" },
              { href: "/pediatric-dentist-palo-alto", label: "Pediatric dentist in Palo Alto" },
              { href: "/teeth-whitening-palo-alto", label: "Teeth whitening in Palo Alto" },
              { href: "/emergency-dental", label: "Emergency dentist in Palo Alto" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="ui-focus-premium group flex min-h-32 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                  {item.label}
                </h3>
                <span className="mt-3 inline-flex items-center text-sm font-semibold text-primary">
                  View details
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <InsuranceInfoSection />
    </>
  );
};

export default Contact;
