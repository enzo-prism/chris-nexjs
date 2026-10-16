// "New patients & forms" (route stays /patient-resources). Server component:
// no client state. Internal links use next/link — the old wouter Link changed
// the URL on this dedicated route without swapping the page.
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Download, Lock, MapPin, ShieldCheck } from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import { PageHero } from "@/components/ds/PageHero";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { ServiceIcon } from "@/components/ds/ServiceIcon";
import { Steps, type Step } from "@/components/ds/Steps";
import { ServiceReviews } from "@/components/ds/ServiceReviews";
import { FaqList } from "@/components/ds/FaqList";
import { CtaBand } from "@/components/ds/CtaBand";
import { faqItems, patientResources } from "@/lib/data";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  type StructuredDataNode,
} from "@/lib/structuredData";

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "New Patients & Forms", path: "/patient-resources" },
];

// What each approved form (lib/data.ts `patientResources.forms`) covers,
// read from the PDFs themselves. Unknown future forms fall back to no note.
const formNotes: Readonly<Record<string, string>> = {
  "Adult New Patient Registration":
    "Contact and insurance details, plus your dental and medical history. 2 pages.",
  "Child New Patient Registration":
    "Your child’s details, parent or guardian and insurance information, and health history. 2 pages.",
  "Medical History Update":
    "Returning patient? A one-page update of your physician, medications, allergies, and health history.",
};

const jumpLinks = [
  { href: "#forms", label: "Forms" },
  { href: "#first-visit", label: "Your first visit" },
  { href: "#bring", label: "What to bring" },
  { href: "#new-patient-faq", label: "FAQs" },
] as const;

const firstVisitSteps: readonly Step[] = [
  {
    title: "Request a visit",
    meta: "About a minute",
    body: (
      <>
        Request online or call the office. The team calls or emails within one business day to confirm a
        time.
      </>
    ),
  },
  {
    title: "Fill in your forms",
    body: (
      <>
        Download the forms on this page, complete them before your appointment, and bring the completed copies.
        Add your insurance carrier to your request so we can check benefits ahead of time.
      </>
    ),
  },
  {
    title: "Arrive and settle in",
    body: <>Arrive 15 minutes before your scheduled time so check-in and any remaining paperwork feel unhurried.</>,
  },
  {
    title: "A comprehensive exam",
    body: (
      <>
        <p>Dr. Wong performs a comprehensive examination and talks through your history, concerns, and goals.</p>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {[
            "Digital X-rays",
            "Oral cancer screening",
            "Gum disease evaluation",
            "Review of dental and medical history",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="mt-1 h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    title: "A clear, personal plan",
    body: (
      <>
        You get a personalized treatment plan with expected costs, including what insurance is likely to
        cover, before you commit. We schedule any follow-up that makes sense.
      </>
    ),
  },
];

const PatientResources = () => {
  const structuredDataNodes: StructuredDataNode[] = [];
  const faqSchema = buildFAQSchema(faqItems, "/patient-resources");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  if (faqSchema) structuredDataNodes.push(faqSchema);
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);

  return (
    <>
      <StructuredData data={structuredDataNodes} />

      <PageHero
        crumbs={breadcrumbItems}
        eyebrow="New patients"
        icon="forms"
        title={
          <>
            New patients: your first visit <em>and forms</em>
          </>
        }
        lead="Everything for your first visit to our Palo Alto office: what happens, what to bring, and the forms you can fill in ahead of time."
        analyticsContext="new-patients-hero"
        showReviews={false}
        media={
          <figure className="relative overflow-hidden rounded-[2rem] bg-cream-200 shadow-lift">
            <div className="relative aspect-[16/10]">
              <Image
                src="/images/redesign/dr-wong-front-desk-laughing.webp"
                alt="Dr. Christopher B. Wong laughing with two team members at the front desk"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
                style={{ objectPosition: "60% 30%" }}
              />
            </div>
            <figcaption className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-2xl bg-cream-50/90 px-4 py-2.5 text-sm font-semibold text-evergreen-900 backdrop-blur sm:bottom-4 sm:left-4 sm:right-auto">
              <span className="h-2 w-2 shrink-0 rounded-full bg-evergreen-500" aria-hidden="true" />
              New patients welcome, from first visits to family care
            </figcaption>
          </figure>
        }
      >
        <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2">
          {jumpLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="pill min-h-11 transition-colors hover:border-evergreen-400 hover:text-evergreen-800"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </PageHero>

      {/* Forms */}
      <Section id="forms" tone="white" labelledBy="forms-title" className="scroll-mt-24">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div>
            <SectionHeading
              id="forms-title"
              eyebrow="Patient forms"
              title={
                <>
                  Fill in your forms <em>before you come</em>
                </>
              }
              lead="Save time at check-in. Each form is a fillable PDF: type your answers, print, and bring the completed copies to your visit."
            />
            <p className="mt-6 flex items-start gap-3 rounded-2xl bg-cream-100 p-4 text-[15px] leading-6 text-ink-soft">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-evergreen-700" aria-hidden="true" />
              <span>
                Forms include health and insurance details, so please bring them to the office rather than
                sending them through the website or email.
              </span>
            </p>
          </div>

          <ul className="reveal-stagger grid content-start gap-3">
            {patientResources.forms.map((form) => (
              <li key={form.url}>
                <a
                  href={form.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card card-lift group flex items-start gap-4 p-4 outline-none sm:items-center sm:gap-5 sm:p-5"
                  data-analytics-context="new-patients-form"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700 transition-colors group-hover:bg-evergreen-800 group-hover:text-gold-300">
                    <ServiceIcon name="forms" className="h-7 w-7" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-[1.2rem] font-medium leading-snug text-ink sm:text-[1.3rem]">
                      {form.name}
                    </span>
                    {formNotes[form.name] ? (
                      <span className="mt-1 block text-sm leading-6 text-ink-muted">{formNotes[form.name]}</span>
                    ) : null}
                    <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-evergreen-700">
                      <Download className="h-4 w-4" aria-hidden="true" />
                      {form.type}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                  </span>
                  <ArrowRight
                    className="hidden h-5 w-5 shrink-0 text-evergreen-600 transition-transform group-hover:translate-x-1 sm:block"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* First visit */}
      <Section id="first-visit" tone="cream" labelledBy="first-visit-title" className="scroll-mt-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-[calc(var(--header-height,76px)+2rem)] lg:self-start">
            <SectionHeading
              id="first-visit-title"
              eyebrow="Your first visit"
              title={
                <>
                  What to expect, <em>step by step</em>
                </>
              }
              lead="We want your first visit to be comfortable and informative, with clear answers before any treatment."
            />
            <Link
              href="/schedule?intent=preventive#appointment"
              className="btn btn-primary mt-8"
              data-analytics-context="new-patients-steps-request"
            >
              Request a new-patient visit
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <Steps steps={firstVisitSteps} />
        </div>
      </Section>

      {/* What to bring + insurance check */}
      <Section id="bring" tone="white" labelledBy="bring-title" className="scroll-mt-24">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="card p-6 sm:p-8">
            <p className="eyebrow">Checklist</p>
            <h2 id="bring-title" className="h-section mt-3 text-[1.9rem] sm:text-[2.3rem]">
              What to <em>bring</em>
            </h2>
            <ul className="mt-6 grid gap-3">
              {patientResources.prepareForVisit.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] leading-6 text-ink">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-evergreen-800 text-gold-300">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-start gap-3 border-t border-cream-300/70 pt-5 text-[15px] leading-6 text-ink-soft">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-evergreen-600" aria-hidden="true" />
              <p>
                <strong className="font-semibold text-ink">Getting here:</strong> nearby street and lot parking. Ask
                the front desk for the best option when you schedule.{" "}
                <Link href="/contact#visit" className="link-rooted">
                  Hours &amp; directions
                </Link>
              </p>
            </div>
          </div>

          <div className="surface-evergreen on-dark relative overflow-hidden rounded-[1.75rem] p-6 shadow-lift sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[url('/brand/roots-glow.svg')] bg-[length:900px_225px] bg-[position:center_-10px] bg-no-repeat opacity-[0.16]"
            />
            <div className="relative">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-gold-300">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="h-section mt-5 text-[1.9rem] sm:text-[2.3rem]">
                We check your <em>insurance first</em>
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-evergreen-100">
                We’re an out-of-network provider for PPO plans, and many PPO plans include out-of-network
                benefits. Add your carrier when you request a visit and we’ll verify your benefits before you
                arrive. No insurance? Ask about our in-house dental plan. We accept Visa, MasterCard, and FSA/HSA
                funds.
              </p>
              <Link
                href="/insurance"
                className="btn btn-outline-light mt-6"
                data-analytics-context="new-patients-insurance"
              >
                How insurance and payment work
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <ServiceReviews
        tags={["visit", "gentle", "honest"]}
        title={
          <>
            What patients say <em>about visiting</em>
          </>
        }
      />

      <Section id="new-patient-faq" tone="white" labelledBy="new-patient-faq-title" className="scroll-mt-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              id="new-patient-faq-title"
              eyebrow="Questions"
              title={
                <>
                  New patient <em>FAQs</em>
                </>
              }
              lead="Don’t see your question here? Send us a note or call the front desk."
            />
            <Link href="/contact" className="btn btn-outline mt-8" data-analytics-context="new-patients-faq-contact">
              Contact the office
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <FaqList items={faqItems} defaultOpen={-1} />
        </div>
      </Section>

      <CtaBand
        analyticsContext="new-patients-cta"
        title={
          <>
            Ready for your <em>first visit?</em>
          </>
        }
      />
    </>
  );
};

export default PatientResources;
