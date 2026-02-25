"use client";

import MetaTags from "@/components/common/MetaTags";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import RelatedServices, { type RelatedServiceLink } from "@/components/common/RelatedServices";
import StructuredData from "@/components/seo/StructuredData";
import TestimonialQuote from "@/components/testimonials/TestimonialQuote";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { officeInfo } from "@/lib/data";
import { getSeoForPath } from "@/lib/seo";
import { getTestimonialsByNames } from "@/lib/testimonials";
import { ArrowRight, CheckCircle, Clock, MapPin, Phone } from "lucide-react";
import {  buildBreadcrumbSchema,
  buildFAQSchema,  buildReviewSchemas,  type StructuredDataNode,
} from "@/lib/structuredData";
import { Link } from "wouter";

const DentistLosAltos = () => {
  const seo = getSeoForPath("/dentist-los-altos");

  const familyTestimonials = getTestimonialsByNames([
    "Anat Sipres",
    "Michael Austin",
    "Marypat Power",
  ]);

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Los Altos Dentist", path: "/dentist-los-altos" },
  ];

  const faqs = [
    {
      question: "Do you accept patients from Los Altos?",
      answer:
        "Yes. Los Altos patients visit our Palo Alto office for preventive care, cosmetic dentistry, and restorative treatment.",
    },
    {
      question: "How far is your office from Los Altos?",
      answer:
        "Our office is a short drive from Los Altos. We will share the easiest route and arrival tips when you schedule.",
    },
    {
      question: "Do you offer family dentistry?",
      answer:
        "Yes. We see kids, teens, adults, and seniors and tailor care to each stage of life.",
    },
    {
      question: "Can you help with cosmetic goals?",
      answer:
        "Yes. We offer whitening, veneers, and Invisalign when appropriate, and we explain which option fits your goals.",
    },
    {
      question: "Do you handle dental emergencies?",
      answer:
        "Yes. If you have pain, swelling, or a broken tooth, call us and we will help you find an urgent visit when available.",
    },
    {
      question: "Can family members coordinate appointments?",
      answer:
        "Often, yes. Call our team and we will do our best to schedule visits together.",
    },
  ];

  const structuredDataNodes: StructuredDataNode[] = [];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const faqSchema = buildFAQSchema(faqs, "/dentist-los-altos");
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);
  if (faqSchema) structuredDataNodes.push(faqSchema);
  structuredDataNodes.push(...buildReviewSchemas(familyTestimonials));

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/dental-cleaning-palo-alto",
      anchorText: "Dental cleanings near Los Altos",
      description: "Preventive visits that keep gum health on track.",
    },
    {
      href: "/teeth-whitening-palo-alto",
      anchorText: "Teeth whitening in Palo Alto",
      description: "In-office and take-home options with dentist supervision.",
    },
    {
      href: "/dental-veneers",
      anchorText: "Dental veneers",
      description: "Cosmetic options for brighter, more balanced smiles.",
    },
    {
      href: "/invisalign",
      anchorText: "Invisalign near Los Altos",
      description: "Clear aligners designed for busy schedules.",
    },
    {
      href: "/emergency-dental",
      anchorText: "Emergency dentist near Los Altos",
      description: "Same-day care for unexpected pain or trauma.",
    },
  ];

  const lastUpdated = "February 2026";

  return (
    <>
      <MetaTags title={seo.title} description={seo.description} />
      {structuredDataNodes.length > 0 && <StructuredData data={structuredDataNodes} />}
      <PageBreadcrumbs items={breadcrumbItems} />

      <section className="bg-[#F5F9FC] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-semibold w-fit">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Near Los Altos
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#1F2933]">
                Los Altos Dentist - Personalized Care Nearby in Palo Alto
              </h1>
              <p className="text-lg text-slate-700 leading-relaxed max-w-3xl">
                Los Altos patients choose Dr. Christopher B. Wong for modern, conservative dentistry in nearby Palo Alto.
                We focus on prevention, comfort, and clear communication so you can feel confident about every decision.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed max-w-3xl">
                Whether you need a routine cleaning, Invisalign, cosmetic improvements, or help with a dental emergency,
                we will explain options and recommend the next step that protects your long-term oral health.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/schedule#appointment">
                  <Button className="bg-primary text-white hover:bg-primary/90">
                    Request an appointment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href={`tel:${officeInfo.phoneE164}`}>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                    Call {officeInfo.phone}
                    <Phone className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2 text-sm text-slate-700 pt-2">
                {[
                  "Family dentistry for every age",
                  "Prevention-first, conservative approach",
                  "Modern digital imaging and planning",
                  "Help verifying PPO insurance benefits",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
                      Office location
                    </p>
                    <p className="mt-2 text-slate-800 leading-relaxed">
                      {officeInfo.address.line1}
                      <br />
                      {officeInfo.address.line2}
                    </p>
                    <a
                      href={officeInfo.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-primary font-semibold hover:underline"
                    >
                      Get directions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
                      Phone
                    </p>
                    <a
                      href={`tel:${officeInfo.phoneE164}`}
                      className="mt-2 inline-flex items-center text-slate-800 font-semibold hover:text-primary transition-colors"
                    >
                      {officeInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
                      Hours
                    </p>
                    <p className="mt-2 text-slate-700 leading-relaxed text-sm">
                      Mon-Thu: {officeInfo.hours.monday}
                      <br />
                      Fri: {officeInfo.hours.friday}
                      <br />
                      Sat-Sun: {officeInfo.hours.saturday}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              Dental care for Los Altos families
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Los Altos families often want a practice that feels consistent and easy to work with. We focus on early
              detection, conservative treatment, and personalized guidance so you can keep your care on track without
              stress.
            </p>
            <p className="text-slate-700 leading-relaxed">
              We help patients build a plan that fits their goals, whether that means preventive care, cosmetic changes,
              or restoring damaged teeth. Our team explains options clearly so you can decide with confidence.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              Common visits for Los Altos patients
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We see Los Altos patients for routine{" "}
              <Link href="/dental-cleaning-palo-alto" className="text-primary font-semibold hover:underline">
                cleanings and exams
              </Link>
              ,{" "}
              <Link href="/cavity-fillings-palo-alto" className="text-primary font-semibold hover:underline">
                tooth-colored fillings
              </Link>
              , and{" "}
              <Link href="/crowns-palo-alto" className="text-primary font-semibold hover:underline">
                dental crowns
              </Link>
              . If you are planning cosmetic improvements, we can review whitening and veneers to match your goals.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Invisalign is also popular for Los Altos patients who want a discreet option for alignment. We will outline
              timelines, costs, and next steps after an in-person evaluation.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#1F2933] mb-4">
              Planning your visit from Los Altos
            </h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              Our Palo Alto office is located at {officeInfo.address.line1}, {officeInfo.address.line2}. We are a short
              drive from Los Altos via Foothill Expressway, and we will share parking tips when you schedule. If you want
              to coordinate multiple appointments, call our team and we will help map out a plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/schedule#appointment">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  Request an appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/patient-resources#insurance">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  Insurance and forms
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#1F2933]">
              Trusted by families across the Peninsula
            </h2>
            <p className="mt-4 text-sm text-[#4B5563] sm:text-base max-w-3xl mx-auto">
              Patients value the calm environment, conservative care, and thoughtful follow-up at every visit.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {familyTestimonials.map((testimonial) => (
              <TestimonialQuote key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>

          <p className="mt-8 text-xs text-slate-500 text-center">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#F5F9FC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading text-[#1F2933] mb-6">
            Los Altos dentist FAQs
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.question}
                value={faq.question}
                className="bg-white rounded-2xl border border-slate-100 px-5"
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
        subtitle="Explore care options for your goals."
        className="bg-white"
      />
    </>
  );
};

export default DentistLosAltos;
