import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ClipboardList, ScanLine, Sprout } from "lucide-react";

import type { Service } from "@shared/schema";
import { GoogleReviewProof } from "@/components/reviews/GoogleReviewProof";
import StructuredData from "@/components/seo/StructuredData";
import FAQSection from "@/components/common/FAQSection";
import ServiceCard from "@/components/common/ServiceCard";
import { PageHero } from "@/components/ds/PageHero";
import { ReviewCard } from "@/components/ds/Reviews";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { serviceReviews } from "@/data/serviceReviews";
import { hubGroups, hubServices } from "@/components/services-hub/hubServices";
import { CostSection, KeepReading } from "@/components/services-hub/ServiceSections";
import { ServicesCtaBand } from "@/components/services-hub/ServicesCtaBand";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildFAQSchema,
  type FAQEntry,
  type StructuredDataNode,
} from "@/lib/structuredData";

const SITE = "https://www.chriswongdds.com";

const servicesFaqs: FAQEntry[] = [
  {
    question: "How do I know which service I need?",
    answer:
      "Start with an exam. We begin with a comprehensive exam and digital imaging to understand your teeth, gums, and bite. From there we map out options and explain timing, cost, and expected results, so you can decide what to do first.",
  },
  {
    question: "How often should I schedule preventive visits?",
    answer:
      "Most patients benefit from exams and cleanings every six months. If you’re managing gum disease, wear down teeth from grinding, or have frequent cavities, we may recommend visits every 3–4 months for added protection.",
  },
  {
    question: "What if I haven’t been to the dentist in a while?",
    answer:
      "You’re not alone. We’ll start with a comfortable, judgment‑free exam and a plan that prioritizes your needs. Even after a long gap, preventive care is the best first step to get back on track.",
  },
  {
    question: "Do you accept dental insurance?",
    answer:
      "We work with most major PPO plans as an out-of-network provider. Many plans include out-of-network benefits, and our team can verify coverage before treatment. We also accept Visa, MasterCard, FSA/HSA funds, and offer an in-house dental plan.",
  },
  {
    question: "Are dental X‑rays safe?",
    answer:
      "Yes. We use modern digital imaging, which reduces radiation exposure significantly compared to older film systems. We only take X‑rays at intervals that match your age, history, and risk level.",
  },
  {
    question: "What if I have a dental emergency?",
    answer:
      "If you have severe pain, swelling, bleeding, or a knocked-out tooth, please call our office right away. We reserve time in our schedule for emergency appointments and will do our best to see you the same day.",
  },
];

// Verbatim quotes from client/src/data/serviceReviews.ts, one per kind of care.
const hubQuoteNames = ["Steve Collins", "Irma Gali", "Jason Jones"] as const;
const hubQuotes = hubQuoteNames.flatMap((name) => serviceReviews.filter((q) => q.name === name));

const examSteps = [
  {
    icon: ScanLine,
    title: "An exam and digital imaging",
    body: "Dr. Wong looks at your teeth, gums, and bite, and explains what he sees in plain language.",
  },
  {
    icon: ClipboardList,
    title: "Options, timing, and cost",
    body: "You’ll hear the choices, what each one involves, and what your plan is expected to cover.",
  },
  {
    icon: Sprout,
    title: "Care in phases, when you’re ready",
    body: "Preventive visits build a healthy foundation; cosmetic or restorative work can follow.",
  },
] as const;

type ServicesProps = {
  /** Server-loaded service records (app/services/page.tsx). The cards now
   *  come from siteNav so they match the header menu; kept for the route
   *  contract. */
  readonly initialServices?: Service[];
  /** Legacy wouter `<Route component>` (client/src/App.tsx) passes route
   *  params; declaring it keeps that call site type-compatible. Unused. */
  readonly params?: unknown;
};

const Services = (_props: ServicesProps) => {
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ];

  const schemas: StructuredDataNode[] = [];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  if (breadcrumbSchema) schemas.push(breadcrumbSchema);
  const faqSchema = buildFAQSchema(servicesFaqs, "/services");
  if (faqSchema) schemas.push(faqSchema);
  schemas.push({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE}/services#item-list`,
    name: "Dental services offered",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: hubServices.length,
    itemListElement: hubServices.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.name,
      description: service.summary,
      url: `${SITE}${service.href}`,
    })),
  });
  const collectionSchema = buildCollectionPageSchema({
    path: "/services",
    name: "Dental services in Palo Alto",
    description:
      "Service hub for preventive, children’s, cosmetic, restorative, and emergency dental care at our Palo Alto office.",
    parts: hubServices.map((service) => ({
      name: service.name,
      path: service.href,
      description: service.summary,
    })),
  });
  if (collectionSchema) schemas.push(collectionSchema);

  return (
    <>
      <StructuredData data={schemas} />

      <PageHero
        crumbs={breadcrumbItems}
        eyebrow="Our services"
        title="Dental services in Palo Alto"
        lead="From routine cleanings to complex restorations, Dr. Christopher B. Wong and our team care for children, teens, and adults from Palo Alto and nearby communities like Menlo Park and Stanford."
        analyticsContext="services-hero"
        chips={["PPO benefits checked first", "New patients welcome"]}
        media={
          <div className="grid grid-cols-5 gap-3 sm:gap-4">
            <figure className="relative col-span-5 aspect-[16/11] overflow-hidden rounded-[2rem] bg-evergreen-900 shadow-lift sm:col-span-3 sm:row-span-2 sm:aspect-auto sm:min-h-[26rem]">
              <Image
                src="/images/redesign/dr-wong-white-coat-front-desk.webp"
                alt="Dr. Christopher B. Wong in a white coat at the front desk"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 28vw"
                className="object-cover object-[50%_22%]"
              />
              <figcaption className="absolute bottom-4 left-4 rounded-full bg-cream-50/90 px-3 py-1 text-sm font-semibold text-ink backdrop-blur">
                Dr. Wong, at the office
              </figcaption>
            </figure>
            <figure className="relative col-span-2 hidden overflow-hidden rounded-[1.5rem] bg-evergreen-900 sm:block">
              <Image
                src="/images/redesign/office-treatment-room.webp"
                alt="Treatment room with a dental chair, monitor, and cabinetry"
                fill
                sizes="(max-width: 1024px) 40vw, 18vw"
                className="object-cover"
              />
            </figure>
            <figure className="relative col-span-2 hidden overflow-hidden rounded-[1.5rem] bg-evergreen-900 sm:block">
              <Image
                src="/images/redesign/office-aquarium-lounge.webp"
                alt="The office lounge, with a reef aquarium and leather chairs"
                fill
                sizes="(max-width: 1024px) 40vw, 18vw"
                className="object-cover object-[60%_40%]"
              />
            </figure>
          </div>
        }
      >
        <nav aria-label="Service categories" className="mt-7">
          <p className="text-sm font-semibold text-ink-muted">Jump to</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {hubGroups.map((group) => (
              <li key={group.id}>
                <a
                  href={`#${group.id}`}
                  className="pill min-h-11 bg-white transition-colors hover:border-evergreen-400 hover:text-evergreen-800"
                >
                  {group.title}
                  <span className="rounded-full bg-evergreen-50 px-2 py-0.5 text-xs font-bold text-evergreen-700">
                    {group.services.length}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>

      {/* Services, in the same four groups as the header menu */}
      <Section tone="white" label="Dental services by category" className="pt-12 sm:pt-16 lg:pt-20">
        <div className="space-y-16 sm:space-y-20">
          {hubGroups.map((group, index) => (
            <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className="scroll-mt-24">
              <div className="flex flex-col gap-3 border-b border-cream-300/80 pb-5 md:flex-row md:items-end md:justify-between md:gap-10">
                <div className="flex items-baseline gap-4">
                  <span aria-hidden="true" className="font-heading text-2xl italic text-gold-600 sm:text-3xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 id={`${group.id}-title`} className="h-section text-[1.9rem] sm:text-[2.4rem]">
                    {group.title}
                  </h2>
                </div>
                <p className="max-w-md text-[15px] leading-7 text-ink-muted md:text-right">{group.blurb}</p>
              </div>
              <div className="reveal-stagger mt-6 grid gap-4 sm:mt-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {group.services.map((service) => (
                  <div key={service.href} className={service.wide ? "md:col-span-2 lg:col-span-3" : undefined}>
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Section>

      {/* Not sure where to start */}
      <Section tone="cream" labelledBy="start-title">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              id="start-title"
              eyebrow="Not sure where to start?"
              title={
                <>
                  The right service starts <em>with an exam</em>
                </>
              }
              lead="We begin with a comprehensive exam and digital imaging to understand your teeth, gums, and bite. Some care happens in phases, and we help you prioritize what will make the biggest difference."
            />
            <Link
              href="/schedule?intent=preventive&source=services-start#appointment"
              className="btn btn-primary mt-8"
              data-analytics-context="services-start-request"
            >
              Request an exam
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <ol className="card reveal divide-y divide-cream-300/70">
            {examSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex items-start gap-4 p-5 sm:p-6">
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-[11px] font-bold text-evergreen-950">
                      {i + 1}
                    </span>
                  </span>
                  <div>
                    <h3 className="h-card text-[1.2rem] sm:text-[1.25rem]">{step.title}</h3>
                    <p className="mt-1 text-[15px] leading-6 text-ink-soft sm:leading-7">{step.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Section>

      <CostSection
        id="insurance"
        title={
          <>
            Insurance and <em>payment</em>
          </>
        }
        lead="We work with most major PPO dental insurance plans as an out-of-network provider. Our team helps you understand your coverage and make the most of your benefits, and patients without insurance can join our in-house dental plan."
        analyticsContext="services-cost"
      />

      {/* Reviews */}
      <Section tone="white" labelledBy="services-reviews-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            id="services-reviews-title"
            eyebrow="Patient reviews"
            title={
              <>
                Patients notice <em>the same things</em> we focus on
              </>
            }
            lead="Thorough cleanings, careful fillings, clear explanations, and a team whole families stay with."
          />
          <Link href="/testimonials" className="btn btn-outline shrink-0 self-start sm:self-auto">
            <GoogleReviewProof surface="services" variant="all-link" />
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <ul className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 md:mx-0 md:mt-10 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          {hubQuotes.map((quote) => (
            <li key={quote.name} className="w-[85%] max-w-[22rem] shrink-0 snap-start md:w-auto md:max-w-none">
              <ReviewCard review={quote} />
            </li>
          ))}
        </ul>
        <p className="mt-1 text-sm text-ink-muted md:hidden" aria-hidden="true">
          Swipe for more reviews →
        </p>
      </Section>

      <FAQSection
        title="Questions about our dental services"
        subtitle="Quick answers about where to start, visit frequency, X‑rays, insurance, and urgent care."
        items={servicesFaqs}
      />

      <KeepReading className="pt-12 sm:pt-16" />

      <ServicesCtaBand />
    </>
  );
};

export default Services;
