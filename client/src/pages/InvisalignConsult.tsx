import { CalendarDays, Phone, ScanLine, Stethoscope, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { getAppointmentTypeForIntent } from "@shared/scheduleRequest";

import StructuredData from "@/components/seo/StructuredData";
import FAQSection from "@/components/common/FAQSection";
import { PageHero } from "@/components/ds/PageHero";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import type { Step } from "@/components/ds/Steps";
import { CostPanel } from "@/components/services/CostPanel";
import { FeatureGrid, type Feature } from "@/components/services/FeatureList";
import { PhotoBadge, ServicePhoto } from "@/components/services/ServicePhoto";
import { StepList } from "@/components/services/StepList";
import ScheduleRequestFunnel from "@/components/sections/ScheduleRequestFunnel";
import { INVISALIGN_CONSULT_FORM_NAME } from "@/lib/appointmentLead";
import { officeInfo } from "@/lib/data";
import {
  buildFAQSchema,
  type FAQEntry,
  type StructuredDataNode,
} from "@/lib/structuredData";

const PATH = "/invisalign-consult";
const CONSULT_HREF = "#appointment";
const HERO_IMAGE = "/images/redesign/jamal-itero-scan.webp";

const whyFeatures: readonly Feature[] = [
  {
    icon: ScanLine,
    title: "Digital scan, not putty",
    body: "A 3D scan maps your teeth precisely and lets Dr. Wong plan each movement before your first aligner.",
  },
  {
    icon: Stethoscope,
    title: "Your dentist, start to finish",
    body: "Invisalign is part of Dr. Wong’s clinical focus. Every plan is created from your scan and monitored at each check-in.",
  },
  {
    icon: ShieldCheck,
    title: "PPO benefits checked first",
    body: "Many PPO plans include orthodontic benefits that can apply to Invisalign. We check yours and explain your portion before treatment.",
  },
  {
    icon: UtensilsCrossed,
    title: "Removable for meals",
    body: "Take aligners out to eat and to brush and floss, so there are no food restrictions.",
  },
];

const visitSteps: readonly Step[] = [
  {
    title: "Consultation and exam",
    meta: "About 60 minutes",
    body: "Dr. Wong evaluates your teeth, gum health, and bite, and talks through your goals. Any cavities or gum inflammation are treated first, so aligners start on a healthy foundation.",
  },
  {
    title: "3D digital scan",
    meta: "About 30 minutes",
    body: "A digital scan creates precise 3D images of your teeth and maps tooth movement more precisely than old-style impressions.",
  },
  {
    title: "Your plan and aligners",
    meta: "About 3–5 weeks",
    body: "Your plan takes about 1–2 weeks, then aligners are made in about 2–3 weeks. You’ll get your first set plus clear instructions for wearing and caring for them.",
  },
  {
    title: "Treatment and check-ins",
    meta: "Often 12–18 months",
    body: "You switch to each new set as directed, often every one to two weeks, and come in periodically so we can confirm your teeth are tracking.",
  },
];

const costFactors = [
  "How much tooth movement and bite correction you need",
  "Whether attachments, elastics, or refinements are recommended",
  "Any dental work needed before you start (cleanings, fillings, gum care)",
  "Retainers and follow-up to protect your result",
  "Orthodontic benefits through PPO insurance, plus HSA/FSA options",
] as const;

const faqs: FAQEntry[] = [
  {
    question: "How long does Invisalign treatment take?",
    answer:
      "Most Invisalign cases take about 12–18 months, but timing depends on the complexity of your bite and how consistently you wear your aligners. Some minor corrections can finish sooner, while more involved plans may take longer. We’ll review your estimated timeline after your digital scan.",
  },
  {
    question: "How many hours per day do I need to wear aligners?",
    answer:
      "For the best results, aligners should be worn 20–22 hours per day. You’ll take them out to eat, drink anything besides water, and brush and floss, then place them right back in.",
  },
  {
    question: "Does Invisalign hurt?",
    answer:
      "You may feel pressure or mild soreness for a day or two when you switch to a new set of aligners. That’s a sign your teeth are moving. Most patients find the discomfort manageable and far less irritating than braces.",
  },
  {
    question: "How much does Invisalign cost?",
    answer:
      "Cost varies based on the amount of tooth movement needed. During your consultation we’ll outline a clear fee estimate, expected phases, and payment options. Many PPO plans include orthodontic benefits that can apply to Invisalign.",
  },
  {
    question: "Can I eat and drink normally with Invisalign?",
    answer:
      "Yes—one of the biggest benefits is that you remove aligners to eat. That means no food restrictions. We recommend brushing before reinserting aligners to keep trays clear and reduce the risk of cavities.",
  },
  {
    question: "What happens after Invisalign is finished?",
    answer:
      "Once your teeth are aligned, you’ll wear retainers to maintain the result. Retainers are typically worn full‑time for a short period and then at night long‑term. We’ll guide you on a schedule that keeps your smile stable.",
  },
];

const InvisalignConsult = () => {
  const schemas: StructuredDataNode[] = [];
  const faqSchema = buildFAQSchema(faqs, PATH);
  if (faqSchema) schemas.push(faqSchema);

  return (
    <>
      {schemas.length ? <StructuredData data={schemas} /> : null}

      <PageHero
        icon="aligner"
        eyebrow="Invisalign® clear aligners"
        title={
          <>
            Straighter teeth with <em>Invisalign</em> in Palo Alto
          </>
        }
        lead="Clear aligner treatment for adults and teens, planned by Dr. Christopher B. Wong from a 3D digital scan, with check-ins built for busy schedules and retainers to keep your result."
        analyticsContext="invisalign-ads-hero"
        chips={["PPO ortho benefits checked first"]}
        className="[&_.btn]:h-auto [&_.btn]:max-w-full [&_.btn]:whitespace-normal [&_.btn]:py-3 [&_.btn]:leading-snug xl:[&_.btn]:whitespace-nowrap xl:[&_.btn]:py-0 xl:[&_.btn]:leading-none"
        actionsClassName="lg:flex-nowrap"
        reviewLinkClassName="min-h-11 max-w-full shrink-0 whitespace-nowrap px-2.5 text-sm gap-1.5 [&_svg]:h-3 [&_svg]:w-3 sm:px-3.5 sm:gap-2 sm:[&_svg]:h-3.5 sm:[&_svg]:w-3.5"
        actions={
          <>
            <a
              href={CONSULT_HREF}
              className="btn btn-lg btn-primary w-full sm:w-auto"
              data-analytics-context="invisalign-ads-hero-consult"
            >
              <CalendarDays aria-hidden="true" />
              Request an Invisalign consult
            </a>
            <a
              href={`tel:${officeInfo.phoneE164}`}
              className="btn btn-lg btn-outline w-full sm:w-auto"
              data-analytics-context="invisalign-ads-hero-call"
              aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
            >
              <Phone aria-hidden="true" />
              <span className="lg:hidden xl:inline">{officeInfo.phone}</span>
              <span className="hidden lg:inline xl:hidden">Call</span>
            </a>
          </>
        }
        media={
          <ServicePhoto
            src={HERO_IMAGE}
            alt="Jamal, registered dental assistant, reviewing a digital scan on the iTero screen"
            focus="35% 40%"
            aspect="aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3]"
            sizes="(max-width: 1024px) 100vw, 46vw"
            badge={
              <PhotoBadge icon="aligner" title="Planned by Dr. Wong">
                Every plan is created from your scan and monitored at each check-in.
              </PhotoBadge>
            }
          />
        }
      />

      <Section id="invisalign-why" tone="white" labelledBy="invisalign-why-title">
        <SectionHeading
          id="invisalign-why-title"
          eyebrow="Why Dr. Wong&apos;s office"
          title={
            <>
              Invisalign planned and <em>checked</em> by your dentist
            </>
          }
          lead="Plans start with a comprehensive exam and a 3D digital scan, stay conservative so results hold, and include check-ins that fit work and school schedules in Palo Alto."
        />
        <FeatureGrid features={whyFeatures} columns={4} headingLevel="h3" className="mt-8 sm:mt-12" />
      </Section>

      <Section id="invisalign-process" tone="cream" labelledBy="invisalign-process-title">
        <SectionHeading
          id="invisalign-process-title"
          eyebrow="How it works"
          title={
            <>
              Four steps, start to <em>finish</em>
            </>
          }
          lead="Consult, scan, a written plan and aligners, then check-ins until your teeth are tracking."
        />
        <StepList steps={visitSteps} columns={4} className="mt-10" />
      </Section>

      <CostPanel
        id="invisalign-cost"
        tone="paper"
        title={
          <>
            Invisalign cost: <em>what affects it</em>
          </>
        }
        lead="Invisalign fees vary because every bite and timeline is different. After your exam and digital scan, you’ll get a clear, written estimate and a walk-through of insurance and payment options."
        drivers={costFactors}
        coverage="Many PPO plans include orthodontic benefits that can apply to Invisalign."
        scheduleHref={`${PATH}${CONSULT_HREF}`}
        buttonLabel="Request an Invisalign consult"
        analyticsContext="invisalign-ads-cost"
      />

      <FAQSection
        title="Invisalign FAQ"
        subtitle="Straight answers about time, comfort, cost, and what happens after aligners."
        items={faqs}
        className="bg-white"
      />

      <ScheduleRequestFunnel
        headingAs="h2"
        title="Request your Invisalign consult"
        lead="About a minute to fill out. We'll call or email within one business day to confirm a time."
        defaultAppointmentType={getAppointmentTypeForIntent("invisalign")}
        leadFormName={INVISALIGN_CONSULT_FORM_NAME}
        requestSource={INVISALIGN_CONSULT_FORM_NAME}
        collapseAppointmentTypes
        showReviews={false}
        showHelpLinks={false}
      />
    </>
  );
};

export default InvisalignConsult;
