import Link from "next/link";
import { ClipboardList, HeartHandshake, Layers, Palette, ShieldCheck, Sprout, Timer, Wrench } from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import FAQSection from "@/components/common/FAQSection";
import RelatedServices, { type RelatedServiceLink } from "@/components/common/RelatedServices";
import { CtaBand } from "@/components/ds/CtaBand";
import { PageHero } from "@/components/ds/PageHero";
import { ReviewedBy } from "@/components/ds/ReviewedBy";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { ServiceIcon } from "@/components/ds/ServiceIcon";
import { ServiceReviews } from "@/components/ds/ServiceReviews";
import { Steps, type Step } from "@/components/ds/Steps";
import { WhoTreats } from "@/components/ds/WhoTreats";
import { CostPanel } from "@/components/services/CostPanel";
import { GuideLinks } from "@/components/services/GuideLinks";
import { JumpNav } from "@/components/services/JumpNav";
import { NearbyLine } from "@/components/services/NearbyLine";
import { PhaseTrack, type Phase } from "@/components/services/PhaseTrack";
import { PhotoBadge, ServicePhoto } from "@/components/services/ServicePhoto";
import {
  FitAndDefinition,
  IconPoints,
  QuickFacts,
  SpokeCards,
  type IconPoint,
  type QuickFact,
  type Spoke,
} from "@/components/services-hub/ServiceBlocks";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildServiceSchema,
  type FAQEntry,
  type StructuredDataNode,
} from "@/lib/structuredData";

const PATH = "/restorative-dentistry";
const SCHEDULE_HREF = "/schedule?intent=restorative&source=restorative-page#appointment";
const HERO_IMAGE = "/images/office/operatory-room.png";

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

const facts: readonly QuickFact[] = [
  { icon: Timer, label: "Fillings", value: "Often finished in one visit" },
  { icon: Layers, label: "Crowns & bridges", value: "Usually two or more visits" },
  { icon: Wrench, label: "Implants", value: "Placed by surgical partners, restored here" },
  { icon: Sprout, label: "Approach", value: "Keep as much natural tooth as possible" },
];

const scale: readonly Phase[] = [
  {
    label: "Tooth-colored filling",
    time: "Small to moderate decay",
    icon: "filling",
    tone: "light",
    weight: 1,
    detail: "Often one visit.",
  },
  {
    label: "Crown",
    time: "Cracked or heavily filled",
    icon: "crown",
    tone: "mid",
    weight: 1,
    detail: "Usually two visits.",
  },
  {
    label: "Bridge or implant crown",
    time: "Missing or unsavable tooth",
    icon: "implant",
    tone: "deep",
    weight: 1,
    detail: "Two or more visits.",
  },
];

const treatments: readonly Spoke[] = [
  {
    title: "Tooth-colored fillings",
    icon: "filling",
    tag: "Often one visit",
    body: "Composite fillings for small to moderate decay that bond to the tooth and match its shade.",
    href: "/cavity-fillings-palo-alto",
    linkLabel: "About fillings",
  },
  {
    title: "Crowns",
    icon: "crown",
    tag: "Usually two visits",
    body: "Full-coverage protection for cracked teeth, large cavities, or teeth with very large old fillings.",
    href: "/crowns-palo-alto",
    linkLabel: "About crowns",
  },
  {
    title: "Bridges",
    icon: "tooth",
    tag: "Replaces a tooth",
    body: "A custom bridge fills the gap from a missing tooth by anchoring to the teeth on either side.",
    href: "/blog/dental-implants-vs-bridge-palo-alto",
    linkLabel: "Implant or bridge?",
  },
  {
    title: "Implant restorations",
    icon: "implant",
    tag: "Replaces a tooth",
    body: "Dr. Wong plans and restores your implant here, with trusted surgical partners for placement.",
    href: "/dental-implants",
    linkLabel: "About dental implants",
  },
];

const visitSteps: readonly Step[] = [
  {
    title: "Exam and digital imaging",
    body: "We look at the tooth, your bite, and gum health together, and explain what we see in plain language.",
  },
  {
    title: "Options, timing, and cost",
    body: "You’ll understand your options before we begin: how many visits each takes and what your plan is expected to cover.",
  },
  {
    title: "Treatment, one step at a time",
    body: "Fillings are often done in one visit. Crowns, bridges, and implant restorations are custom-made, so they take two or more.",
  },
  {
    title: "Bite check and care tips",
    body: "We check your bite and how the restoration feels, then explain how to care for it so it lasts.",
  },
];

const comfort: readonly IconPoint[] = [
  {
    icon: HeartHandshake,
    title: "Gentle and step by step",
    body: "Anxious about dental work? We explain what’s happening and adjust the pace.",
  },
  {
    icon: Palette,
    title: "Natural-looking materials",
    body: "Tooth-colored materials, with shade and shape customized to blend in.",
  },
  {
    icon: ShieldCheck,
    title: "Conservative by default",
    body: "We protect what’s healthy and restore only what’s compromised.",
  },
  {
    icon: ClipboardList,
    title: "Clear options first",
    body: "Your timeline and estimate are outlined before treatment starts.",
  },
];

const relatedServices: RelatedServiceLink[] = [
  {
    href: "/emergency-dental",
    anchorText: "Emergency dental care",
    description: "Same-day visits when we can for sudden pain or damage.",
  },
  {
    href: "/dental-cleaning-palo-alto",
    anchorText: "Teeth cleanings and exams",
    description: "Routine exams catch small problems before they need bigger repairs.",
  },
  {
    href: "/dental-veneers",
    anchorText: "Dental veneers",
    description: "Reshape chipped, worn, or uneven front teeth, planned conservatively.",
  },
];

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Restorative dentistry", path: PATH },
];

const RestorativeDentistry = () => {
  const schemas: StructuredDataNode[] = [
    buildServiceSchema({
      name: "Restorative Dentistry",
      pageName: "Restorative dentistry in Palo Alto",
      description:
        "Restorative dentistry including fillings, crowns, bridges, and implant restorations to repair damaged or missing teeth.",
      slug: PATH,
      image: HERO_IMAGE,
      serviceType: "Restorative dentistry",
    }),
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  if (breadcrumbSchema) schemas.push(breadcrumbSchema);
  const faqSchema = buildFAQSchema(restorativeFaqs, PATH);
  if (faqSchema) schemas.push(faqSchema);

  return (
    <>
      <StructuredData data={schemas} />

      <PageHero
        crumbs={breadcrumbItems}
        icon="crown"
        eyebrow="Repair and replace"
        title={
          <>
            Restorative dentistry in <em>Palo Alto</em>
          </>
        }
        lead="When a tooth is damaged or missing, Dr. Christopher B. Wong plans conservative repairs that look natural, restore comfortable chewing, and hold up to everyday life."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="restorative-hero"
        chips={["PPO benefits checked first"]}
        media={
          <ServicePhoto
            src={HERO_IMAGE}
            alt="Dr. Christopher B. Wong in a treatment room that looks onto the garden courtyard"
            focus="35% 35%"
            aspect="aspect-[16/10] lg:aspect-[6/5]"
            badge={
              <PhotoBadge icon="tooth" title="Natural tooth first">
                Repairs planned to protect what’s healthy.
              </PhotoBadge>
            }
          />
        }
      />

      <Section id="restorative-overview" tone="white" className="pt-10 sm:pt-14 lg:pt-16" labelledBy="restorative-fit-title">
        <JumpNav
          items={[
            { href: "#restorative-overview", label: "Signs" },
            { href: "#restorative-treatments", label: "Treatments" },
            { href: "#restorative-visit", label: "Your visit" },
            { href: "#restorative-cost", label: "Cost & insurance" },
            { href: "#restorative-faq", label: "FAQ" },
          ]}
        />
        <ReviewedBy date="2026-10-16" className="mt-7" />
        <QuickFacts facts={facts} className="mt-5" />

        <FitAndDefinition
          className="mt-12 lg:mt-20"
          fitId="restorative-fit-title"
          fitTitle={
            <>
              Signs a tooth <em>needs repair</em>
            </>
          }
          signs={[
            "Lingering sensitivity to cold or sweets",
            "Pain when you bite down",
            "A chipped edge, or a filling that feels rough",
            "A cracked, broken, or heavily filled tooth",
            "A missing tooth, or one that can’t be saved",
          ]}
          signsNote="Sometimes there are no symptoms at all, which is why routine exams matter."
          whatId="what-is-restorative-dentistry"
          whatTitle="What is restorative dentistry?"
        >
          <p>
            Restorative dentistry repairs teeth that are decayed, cracked, worn, or missing, to bring back comfortable
            chewing, a natural appearance, and long-term stability. It often starts with something small: a cavity, a
            chipped edge, or an old filling that has worn down.
          </p>
          <p>
            Catching these early lets us repair the tooth conservatively, preserving healthy enamel and avoiding bigger
            procedures later. Dr. Wong prioritizes stability over quick fixes, looking at how your bite, gum health, and
            tooth structure work together.
          </p>
        </FitAndDefinition>
      </Section>

      <Section id="restorative-treatments" tone="cream" labelledBy="restorative-treatments-title">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
          <SectionHeading
            id="restorative-treatments-title"
            eyebrow="Treatments"
            title={
              <>
                Treatments we <em>commonly provide</em>
              </>
            }
            lead="Modern materials and precise planning rebuild teeth in a way that supports natural chewing forces."
          />
          <div className="card p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">The earlier, the simpler</p>
            <PhaseTrack phases={scale} label="How repairs grow as damage grows" className="mt-4" />
          </div>
        </div>
        <SpokeCards items={treatments} columns={4} rail className="mt-10" />
        <p className="mt-5 flex items-start gap-3 rounded-[1.5rem] border border-cream-300/80 bg-white/80 px-5 py-4 text-[15px] leading-7 text-ink-soft">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-evergreen-800 text-gold-300">
            <ServiceIcon name="emergency" className="h-5 w-5" animated={false} />
          </span>
          <span>
            <strong className="font-semibold text-ink">Emergency repairs:</strong> sudden pain, a fracture, or a lost
            filling or crown? Call first; we reserve time for urgent visits.{" "}
            <Link href="/emergency-dental" className="link-rooted">
              Emergency dental care
            </Link>
          </span>
        </p>

        <div
          id="restorative-visit"
          className="mt-14 grid scroll-mt-24 gap-8 sm:mt-20 lg:grid-cols-[0.85fr_1.15fr] lg:grid-rows-[auto_1fr] lg:gap-x-16"
        >
          <SectionHeading
            eyebrow="Your visit, step by step"
            title={
              <>
                A conservative, <em>long-term approach</em>
              </>
            }
          />
          <Steps steps={visitSteps} className="lg:col-start-2 lg:row-span-2 lg:row-start-1" />
          <GuideLinks
            className="lg:col-start-1 lg:row-start-2"
            columns={1}
            title="Guides from our blog"
            guides={[
              { href: "/blog/crown-vs-filling-palo-alto", title: "Crown vs filling: which does your tooth need?" },
              { href: "/blog/dental-implants-vs-bridge-palo-alto", title: "Implant or bridge? How to choose" },
              { href: "/blog/cracked-tooth-emergency-dentist-palo-alto", title: "When is a cracked tooth an emergency?" },
            ]}
          />
        </div>

        <div className="mt-14 sm:mt-20">
          <h3 className="h-card text-[1.45rem] sm:text-[1.7rem]">
            Comfort and <em>materials</em>
          </h3>
          <IconPoints items={comfort} columns={4} rail headingLevel="h4" className="mt-5" />
        </div>
      </Section>

      <CostPanel
        id="restorative-cost"
        title={
          <>
            Restorative cost and <em>insurance</em>
          </>
        }
        lead="Every restoration starts with a clear estimate. We check your PPO benefits first and explain your portion before treatment begins."
        drivers={[
          "Which restoration the tooth needs",
          "The material, and how many teeth are involved",
          "Whether other care is needed first",
          "Your plan’s benefits for basic and major care",
        ]}
        coverage="Many plans cover fillings as basic care and crowns, bridges, and implant crowns as major care."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="restorative-cost"
      />

      <ServiceReviews
        tags={["gentle", "honest"]}
        title={
          <>
            Gentle, honest <em>care</em>
          </>
        }
        note="Reviews about Dr. Wong’s care in general, not one specific treatment."
      />

      <WhoTreats
        teamSlugs={["jamal", "rachel"]}
        intro="Dr. Wong plans your restorative care, explains your options before he begins, and keeps as much natural tooth as possible. Implants are placed by trusted surgical partners and restored here."
      />

      <div id="restorative-faq" className="scroll-mt-24">
        <FAQSection
          title="Restorative dentistry FAQs"
          subtitle="Signs, visits, materials, and staying comfortable."
          items={restorativeFaqs}
        />
      </div>

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="If you need a specific restoration, start with the treatment cards above."
      />
      <NearbyLine />

      <CtaBand
        analyticsContext="restorative-cta"
        showSteps={false}
        title={
          <>
            A tooth that needs <em>attention?</em>
          </>
        }
        lead="Request a consultation online in about a minute, or call the front desk. In pain right now? Call, and we’ll do our best to see you the same day."
      />
    </>
  );
};

export default RestorativeDentistry;
