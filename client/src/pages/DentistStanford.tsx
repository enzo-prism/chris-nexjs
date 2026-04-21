"use client";

import MetaTags from "@/components/common/MetaTags";
import OfficeHoursSummary from "@/components/common/OfficeHoursSummary";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import RelatedServices, { type RelatedServiceLink } from "@/components/common/RelatedServices";
import OptimizedImage from "@/components/seo/OptimizedImage";
import StructuredData from "@/components/seo/StructuredData";
import TestimonialQuote from "@/components/testimonials/TestimonialQuote";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { officeInfo } from "@/lib/data";
import { getSeoForPath } from "@/lib/seo";
import { getTestimonialsByNames } from "@/lib/testimonials";
import { ArrowRight, CheckCircle, Clock, MapPin, Phone } from "lucide-react";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildReviewSchemas,
  type StructuredDataNode,
} from "@/lib/structuredData";
import { Link } from "wouter";

const DentistStanford = () => {
  const seo = getSeoForPath("/dentist-stanford");

  const stanfordTestimonials = getTestimonialsByNames([
    "Madison Ho",
    "Kevin Zhang",
    "Sandra Bell",
  ]);

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Stanford Dentist", path: "/dentist-stanford" },
  ];

  const faqs = [
    {
      question: "Do you see Stanford students and faculty?",
      answer:
        "Yes. We regularly care for Stanford students, faculty, staff, and families who want a nearby Palo Alto dental office with a practical, conservative approach.",
    },
    {
      question: "Can you help with dental emergencies?",
      answer:
        "Yes. If you have sudden pain, swelling, a chipped tooth, or a broken filling, call us as soon as you can and we will help you find the soonest urgent visit available.",
    },
    {
      question: "Do you offer Invisalign for Stanford patients?",
      answer:
        "Yes. Invisalign is a popular option for students and professionals who want discreet orthodontic treatment that fits around classes, research, and work.",
    },
    {
      question: "Is your office close to campus?",
      answer:
        "Yes. Our Palo Alto office is a short drive or bike ride from Stanford, making it realistic to fit visits between classes, meetings, and hospital shifts.",
    },
    {
      question: "Do you accept PPO dental insurance?",
      answer:
        "We work with many PPO plans and can help verify benefits before treatment so there are fewer surprises.",
    },
    {
      question: "Can you help me plan care around quarters or travel?",
      answer:
        "Yes. If you are heading into finals, a busy rotation, or a school break, we can help prioritize the most important treatment and build a sensible schedule.",
    },
  ];

  const structuredDataNodes: StructuredDataNode[] = [];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const faqSchema = buildFAQSchema(faqs, "/dentist-stanford");
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);
  if (faqSchema) structuredDataNodes.push(faqSchema);
  structuredDataNodes.push(...buildReviewSchemas(stanfordTestimonials));

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/dental-cleaning-palo-alto",
      anchorText: "Dental cleanings near Stanford",
      description: "Preventive visits that help you avoid mid-quarter surprises.",
    },
    {
      href: "/invisalign",
      anchorText: "Invisalign near Stanford",
      description: "Clear aligners for students, residents, and working professionals.",
    },
    {
      href: "/emergency-dental",
      anchorText: "Emergency dental care near Stanford",
      description: "Same-day help for urgent pain, chips, and broken teeth.",
    },
    {
      href: "/cavity-fillings-palo-alto",
      anchorText: "Cavity fillings in Palo Alto",
      description: "Tooth-colored repairs with a conservative treatment philosophy.",
    },
    {
      href: "/crowns-palo-alto",
      anchorText: "Dental crowns near Stanford",
      description: "Added protection when a tooth needs more support.",
    },
  ];

  const lastUpdated = "March 2026";

  return (
    <>
      <MetaTags title={seo.title} description={seo.description} />
      {structuredDataNodes.length > 0 && <StructuredData data={structuredDataNodes} />}
      <PageBreadcrumbs items={breadcrumbItems} />

      <section className="bg-[#F5F9FC] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary w-fit">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Near Stanford
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#1F2933]">
                Stanford Dentist - Convenient Palo Alto Care for Campus Life
              </h1>
              <p className="text-lg text-slate-700 leading-relaxed max-w-3xl">
                Stanford students, faculty, staff, and families often want a dentist close to campus who can keep care
                simple, modern, and easy to schedule. Our Palo Alto office provides conservative dentistry with clear
                explanations and a calm experience.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed max-w-3xl">
                We help with preventive cleanings, fillings, crowns, Invisalign, and urgent dental issues. Whether you
                are balancing classes, lab work, hospital shifts, or family life, we focus on practical next steps that
                protect your long-term oral health.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/schedule#appointment">
                  <Button className="ui-btn-primary">
                    Request an appointment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href={`tel:${officeInfo.phoneE164}`}>
                  <Button variant="outline" className="ui-btn-outline">
                    Call {officeInfo.phone}
                    <Phone className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>

              <ul className="grid gap-3 pt-2 text-sm text-slate-700 sm:grid-cols-2">
                {[
                  "Nearby care for students, faculty, and families",
                  "Prevention-first, conservative approach",
                  "Same-day help for urgent dental problems",
                  "Guidance with PPO benefits and scheduling",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="relative">
                  <OptimizedImage
                    src="/images/stanford-dentist.png"
                    alt="Stanford student speaking with the dental team in our Palo Alto office with Hoover Tower visible outside"
                    width={1536}
                    height={1024}
                    priority
                    fetchPriority="high"
                    sizes="(max-width: 1024px) 100vw, 38vw"
                    quality={72}
                    className="aspect-[3/2] w-full"
                    objectPosition="58% 50%"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-900 shadow-sm">
                    Near campus
                  </div>
                </div>
                <div className="border-t border-slate-100 px-5 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    A Palo Alto dental visit that feels easy to fit into Stanford life
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    This page is for students, faculty, staff, and families who want a calm office close to campus,
                    with modern care and straightforward next steps.
                  </p>
                </div>
              </div>

              <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                      Office location
                    </p>
                    <p className="mt-2 leading-relaxed text-slate-800">
                      {officeInfo.address.line1}
                      <br />
                      {officeInfo.address.line2}
                    </p>
                    <a
                      href={officeInfo.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center ui-link-premium"
                    >
                      Get directions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                      Phone
                    </p>
                    <a
                      href={`tel:${officeInfo.phoneE164}`}
                      className="mt-2 inline-flex items-center font-semibold text-slate-800 transition-colors hover:text-primary"
                    >
                      {officeInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                      Hours
                    </p>
                    <OfficeHoursSummary
                      className="mt-2 text-sm text-slate-700"
                      noteClassName="text-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              Dental care for Stanford students, faculty, and families
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Life at Stanford moves quickly, and dental care should not feel like one more complicated task. We help
              patients stay ahead of problems with efficient preventive visits, clear treatment planning, and practical
              follow-up that works with a full calendar.
            </p>
            <p className="text-slate-700 leading-relaxed">
              If you are new to the area, juggling a heavy academic schedule, or coordinating care for your household,
              we will walk through what matters most first. Our goal is to make decisions feel straightforward and keep
              treatment aligned with your priorities.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              Care that fits the Stanford schedule
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6">
                <h3 className="mb-3 text-xl font-semibold text-slate-900">Students</h3>
                <p className="leading-relaxed text-slate-700">
                  Cleanings, exams, cavity checks, and bite-friendly planning that fit around classes, finals, and
                  travel. Many students also choose{" "}
                  <Link href="/invisalign" className="ui-link-premium">
                    Invisalign
                  </Link>{" "}
                  because it is discreet and easy to manage.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6">
                <h3 className="mb-3 text-xl font-semibold text-slate-900">Faculty and staff</h3>
                <p className="leading-relaxed text-slate-700">
                  Preventive care, restorative treatment, and long-term planning for busy professional schedules. We
                  focus on clear recommendations and efficient visits that make sense between meetings and teaching.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6">
                <h3 className="mb-3 text-xl font-semibold text-slate-900">Residents and researchers</h3>
                <p className="leading-relaxed text-slate-700">
                  When your time is limited, we help prioritize the most important care first. If a tooth starts
                  hurting, our{" "}
                  <Link href="/emergency-dental" className="ui-link-premium">
                    emergency dental care
                  </Link>{" "}
                  team can often help quickly.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6">
                <h3 className="mb-3 text-xl font-semibold text-slate-900">Families</h3>
                <p className="leading-relaxed text-slate-700">
                  For Stanford families living nearby, we provide a calm, prevention-focused environment for every age.
                  If your child needs a gentle start, explore{" "}
                  <Link href="/pediatric-dentist-palo-alto" className="ui-link-premium">
                    pediatric dentistry
                  </Link>{" "}
                  in Palo Alto.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              Common visits for Stanford patients
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Many Stanford patients come to us for routine{" "}
              <Link href="/dental-cleaning-palo-alto" className="ui-link-premium">
                cleanings and exams
              </Link>
              ,{" "}
              <Link href="/cavity-fillings-palo-alto" className="ui-link-premium">
                tooth-colored fillings
              </Link>
              , and{" "}
              <Link href="/crowns-palo-alto" className="ui-link-premium">
                dental crowns
              </Link>{" "}
              when a tooth needs added support. We also see plenty of patients who want proactive care before a busy
              quarter or an upcoming trip.
            </p>
            <p className="text-slate-700 leading-relaxed">
              If alignment is part of your goals,{" "}
              <Link href="/invisalign" className="ui-link-premium">
                Invisalign
              </Link>{" "}
              is a common choice because it blends into day-to-day campus life. And if a filling breaks or pain starts
              suddenly, staying close to Stanford makes urgent dental care much more realistic.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-bold font-heading text-[#1F2933] md:text-3xl">
              Planning around classes, clinic shifts, or travel
            </h2>
            <p className="mb-6 leading-relaxed text-slate-700">
              If you are trying to fit care between classes, research deadlines, hospital shifts, or school breaks, our
              team can help build a sensible plan. We will also share parking and arrival tips so your visit feels
              predictable from the start.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/schedule#appointment">
                <Button className="ui-btn-primary">
                  Request an appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/patient-resources#insurance">
                <Button variant="outline" className="ui-btn-outline">
                  Insurance and forms
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933] md:text-4xl">
              Trusted by patients across the Peninsula
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-sm text-[#4B5563] sm:text-base">
              Patients appreciate the clear communication, conservative care, and calm experience whether they are
              coming from campus, nearby neighborhoods, or surrounding Peninsula communities.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {stanfordTestimonials.map((testimonial) => (
              <TestimonialQuote key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="bg-[#F5F9FC] py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold font-heading text-[#1F2933]">
            Stanford dentist FAQs
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.question}
                value={faq.question}
                className="rounded-2xl border border-slate-100 bg-white px-5"
              >
                <AccordionTrigger className="text-left text-slate-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="Popular care options for students, professionals, and families near Stanford."
        className="bg-white"
      />
    </>
  );
};

export default DentistStanford;
