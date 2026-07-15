"use client";

import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
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
import { Link } from "wouter";
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
              Contact Our Palo Alto Dental Office
            </h1>
            <p className="text-xl text-[#333333] max-w-3xl mx-auto">
              Schedule your visit with Dr. Wong’s dental practice at {officeInfo.address.line1},{" "}
              {officeInfo.address.city}, {officeInfo.address.region} {officeInfo.address.postalCode}.
              We offer flexible appointment times for new and returning patients.
            </p>
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
                  Great for records questions, referrals, and non-urgent follow-up.
                </p>
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

      <section id="message" className="bg-white py-12 md:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-heading text-2xl font-bold text-slate-900">
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
              Ready to request a visit?
            </h2>
            <p className="mt-3 leading-7 text-blue-50">
              The appointment form asks only for the details our scheduling
              team needs to follow up and confirm a time.
            </p>
            <Link
              href="/schedule#appointment"
              className="ui-focus-premium mt-6 inline-flex min-h-11 items-center rounded-full bg-white px-5 py-3 font-semibold text-primary hover:bg-blue-50"
            >
              Request an appointment
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="mt-5 text-sm leading-6 text-blue-100">
              In pain or dealing with a dental emergency? Call {officeInfo.phone}
              for the fastest response.
            </p>
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
        schemaImage="https://www.chriswongdds.com/images/dr_wong_polaroids.png"
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
              <Link key={item.href} href={item.href}>
                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                    {item.label}
                  </h3>
                  <span className="mt-3 inline-flex items-center text-sm font-semibold text-primary">
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
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
