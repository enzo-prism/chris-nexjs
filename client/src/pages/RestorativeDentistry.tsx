"use client";

import MetaTags from "@/components/common/MetaTags";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import RelatedServices, { type RelatedServiceLink } from "@/components/common/RelatedServices";
import StructuredData from "@/components/seo/StructuredData";
import FAQSection from "@/components/common/FAQSection";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildServiceSchema,
  type FAQEntry,
} from "@/lib/structuredData";
import { getSeoForPath } from "@/lib/seo";

const restorativeFaqs: FAQEntry[] = [
  {
    question: "What is restorative dentistry?",
    answer:
      "Restorative dentistry focuses on repairing teeth that are decayed, cracked, worn, or missing. The goal is to bring back comfortable chewing, a natural appearance, and long‑term stability.",
  },
  {
    question: "How do I know if I need restorative treatment?",
    answer:
      "Common signs include lingering sensitivity, pain when biting, a chipped edge, or a filling that feels rough. Sometimes there are no symptoms, which is why routine exams are important. We’ll explain what we see and your options clearly.",
  },
  {
    question: "Will treatment take multiple visits?",
    answer:
      "Smaller restorations like fillings are often completed in one visit. Crowns, bridges, and implant restorations typically take two or more visits because they’re custom‑made. We’ll outline your timeline in advance.",
  },
  {
    question: "Do restorations look natural?",
    answer:
      "Yes. We use modern tooth‑colored materials and customize shade and shape so repairs blend with your smile. Function and aesthetics are planned together.",
  },
  {
    question: "What if I’m anxious about dental work?",
    answer:
      "Let us know. We take a gentle, step‑by‑step approach, explain what’s happening, and can adjust pacing so you feel comfortable throughout treatment.",
  },
];

const RestorativeDentistry = () => {
  const seo = getSeoForPath("/restorative-dentistry");

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Restorative Dentistry", path: "/restorative-dentistry" },
  ];

  const restorativeServiceSchema = buildServiceSchema({
    name: "Restorative Dentistry",
    description:
      "Restorative dentistry including fillings, crowns, bridges, and implant restorations to repair damaged or missing teeth.",
    slug: "/restorative-dentistry",
  });

  const restorativeBreadcrumbs = buildBreadcrumbSchema(breadcrumbItems);
  const restorativeFaqSchema = buildFAQSchema(restorativeFaqs, "/restorative-dentistry");

  const schemas = [restorativeServiceSchema];
  if (restorativeBreadcrumbs) schemas.push(restorativeBreadcrumbs);
  if (restorativeFaqSchema) schemas.push(restorativeFaqSchema);

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/cavity-fillings-palo-alto",
      anchorText: "Cavity fillings in Palo Alto",
      description: "Tooth‑colored fillings for small to moderate decay.",
    },
    {
      href: "/crowns-palo-alto",
      anchorText: "Dental crowns in Palo Alto",
      description: "Full‑coverage protection for cracked or heavily filled teeth.",
    },
    {
      href: "/dental-implants",
      anchorText: "Dental implants in Palo Alto",
      description: "Stable replacements for missing teeth.",
    },
    {
      href: "/emergency-dental",
      anchorText: "Emergency dental care",
      description: "Same‑day visits for sudden pain or damage.",
    },
  ];

  return (
    <>
      <MetaTags title={seo.title} description={seo.description} />
      <StructuredData data={schemas} />
      <PageBreadcrumbs items={breadcrumbItems} />

      <section className="bg-gradient-to-b from-[#F5F9FC] to-white py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900">
            Restorative Dentistry in Palo Alto
          </h1>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-3xl mx-auto">
            When a tooth is damaged or missing, restorative dentistry rebuilds comfort,
            function, and confidence. Dr. Christopher B. Wong provides conservative
            restorations designed to look natural and hold up to everyday life.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/schedule#appointment">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Schedule a consult
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                Talk to our team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-bold font-heading text-slate-900">
            Repairing teeth early keeps treatment simple
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Restorative care often starts with something small: a cavity, a chipped
            edge, or an old filling that has worn down. Catching these issues early
            allows us to repair the tooth conservatively, preserving healthy enamel
            and avoiding bigger procedures later.
          </p>

          <h2 className="text-3xl font-bold font-heading text-slate-900">
            Treatments we commonly provide
          </h2>
          <p className="text-slate-700 leading-relaxed">
            We use modern materials and precise planning to rebuild teeth in a way that
            supports natural chewing forces.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700 leading-relaxed">
            <li>
              <strong>Composite fillings</strong> for small to moderate decay.
            </li>
            <li>
              <strong>Crowns</strong> to protect cracked teeth or large cavities.
            </li>
            <li>
              <strong>Bridges and implant restorations</strong> to replace missing teeth.
            </li>
            <li>
              <strong>Emergency repairs</strong> for sudden pain, fractures, or lost restorations.
            </li>
          </ul>

          <h2 className="text-3xl font-bold font-heading text-slate-900">
            A conservative, long‑term approach
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Dr. Wong prioritizes stability over quick fixes. We look at how your bite,
            gum health, and tooth structure work together, then recommend restorations
            that protect what’s healthy and restore what’s compromised. You’ll always
            understand your options before we begin.
          </p>
        </div>
      </section>

      <FAQSection items={restorativeFaqs} title="Restorative dentistry FAQs" />

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="If you need a specific restoration, explore these pages."
        className="bg-white"
      />
    </>
  );
};

export default RestorativeDentistry;

