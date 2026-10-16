import Link from "next/link";
import { CalendarClock, HeartHandshake, ScanLine, ShieldCheck, Smile, Sparkles, Stethoscope } from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import FAQSection from "@/components/common/FAQSection";
import RelatedServices, { type RelatedServiceLink } from "@/components/common/RelatedServices";
import { CtaBand } from "@/components/ds/CtaBand";
import { PageHero } from "@/components/ds/PageHero";
import { ReviewedBy } from "@/components/ds/ReviewedBy";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { ServiceReviews } from "@/components/ds/ServiceReviews";
import { Steps, type Step } from "@/components/ds/Steps";
import { WhoTreats } from "@/components/ds/WhoTreats";
import { CostPanel } from "@/components/services/CostPanel";
import { Disclosure } from "@/components/services/Disclosure";
import { GuideLinks } from "@/components/services/GuideLinks";
import { JumpNav } from "@/components/services/JumpNav";
import { NearbyLine } from "@/components/services/NearbyLine";
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

const PATH = "/dental-cleaning-palo-alto";
const SCHEDULE_HREF = "/schedule?intent=preventive&source=cleaning-page#appointment";
const HERO_IMAGE = "/images/redesign/team-shared-laugh-treatment-room.webp";

const faqs: FAQEntry[] = [
  {
    question: "How often should I get a dental cleaning?",
    answer:
      "Most patients do best with cleanings every six months. If you have gum disease, implants, or frequent cavities, we may recommend visits every 3–4 months.",
  },
  {
    question: "Do cleanings hurt?",
    answer:
      "Cleanings are usually comfortable. If you have sensitivity or inflamed gums, we’ll use a gentle approach and can add topical numbing as needed.",
  },
  {
    question: "What happens during a cleaning visit?",
    answer:
      "We remove plaque and tartar, polish stains, floss, and review home care. You’ll also receive a thorough exam and screening for cavities and gum issues.",
  },
  {
    question: "Can a cleaning help with bad breath?",
    answer:
      "Yes. Removing bacteria and tartar from below the gumline is one of the most effective ways to reduce chronic bad breath.",
  },
  {
    question: "Is a cleaning the same as a deep cleaning?",
    answer:
      "A routine cleaning is for healthy gums. A deep cleaning (scaling and root planing) treats gum infection. We’ll tell you which is appropriate after your exam.",
  },
];

const facts: readonly QuickFact[] = [
  { icon: CalendarClock, label: "How often", value: "Every 6 months for most; 3–4 if needed" },
  { icon: Sparkles, label: "Includes", value: "Cleaning, polish, gum check, and exam" },
  { icon: Smile, label: "Comfort", value: "Gentle, with topical numbing as needed" },
  { icon: ShieldCheck, label: "Insurance", value: "PPO benefits checked before your visit" },
];

const visitSteps: readonly Step[] = [
  {
    title: "Plaque and tartar removal",
    body: "Your hygienist gently clears plaque and hardened tartar, including along and just under the gumline, where brushing can’t reach.",
  },
  {
    title: "Polish, floss, and a gum check",
    body: "Surface stains are polished away, and we measure the pockets around your teeth. Early signs of gum disease? We’ll explain how to reverse it before it becomes chronic.",
  },
  {
    title: "Your exam with Dr. Wong",
    body: "A starting cavity can get a small, conservative filling; a cracked tooth can be repaired before it becomes painful.",
  },
  {
    title: "Home care and your next visit",
    body: "A personalized home-care review, and a cleaning interval based on your risk factors, not a one-size-fits-all schedule.",
  },
];

const cleaningTypes: readonly Spoke[] = [
  {
    title: "Routine cleaning",
    icon: "brush",
    tag: "Most visits",
    body: "For healthy gums. Resets your mouth to a healthy baseline and keeps your smile looking polished.",
    points: ["Plaque, tartar, and stain removal", "Paired with an exam", "Usually every six months"],
  },
  {
    title: "Deep cleaning",
    icon: "gum",
    tag: "When gums need it",
    body: "Scaling and root planing treats gum infection below the gumline so gums can heal and reattach.",
    points: ["Only after an exam shows it’s needed", "May take more than one visit", "Then back to simple maintenance"],
  },
];

const comfort: readonly IconPoint[] = [
  {
    icon: HeartHandshake,
    title: "A gentle approach",
    body: "Sensitive teeth or inflamed gums? We go gently and can add topical numbing.",
  },
  {
    icon: Stethoscope,
    title: "Long-time hygienists",
    body: "Angelisa has cared for patients here since 2008; Helen has more than 15 years of hygiene experience.",
  },
  {
    icon: ScanLine,
    title: "Digital X-rays when due",
    body: "Far less radiation than film, taken only at intervals that fit your risk.",
  },
  {
    icon: ShieldCheck,
    title: "Careful infection control",
    body: "We follow current CDC and ADA infection-control guidelines at every visit.",
  },
];

const relatedServices: RelatedServiceLink[] = [
  {
    href: "/preventive-dentistry",
    anchorText: "Preventive dentistry",
    description: "Exams, digital X-rays, sealants, fluoride, and custom guards planned around your risk.",
  },
  {
    href: "/cavity-fillings-palo-alto",
    anchorText: "Tooth-colored fillings",
    description: "Small, conservative fillings when your exam finds a cavity early.",
  },
  {
    href: "/teeth-whitening-palo-alto",
    anchorText: "Teeth whitening",
    description: "Brighten your smile after a fresh cleaning, in-office or at home.",
  },
];

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Cleanings & exams", path: PATH },
];

const DentalCleaningPaloAlto = () => {
  const schemas: StructuredDataNode[] = [
    buildServiceSchema({
      name: "Dental Cleaning",
      pageName: "Teeth cleanings and exams in Palo Alto",
      description:
        "Professional dental cleanings and exams in Palo Alto to remove plaque and tartar and keep gums healthy, with deep cleaning (scaling and root planing) when gums need it.",
      slug: PATH,
      image: HERO_IMAGE,
      serviceType: "Preventive dentistry",
      procedure: {
        name: "Professional teeth cleaning (dental prophylaxis)",
        procedureType: "Noninvasive",
        bodyLocation: "Teeth and gums",
        howPerformed:
          "A registered dental hygienist removes plaque and tartar above and just below the gumline, polishes and flosses the teeth, and checks gum pockets, followed by an exam.",
        followup: "A personalized home-care review and a cleaning interval based on your risk factors.",
      },
    }),
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  if (breadcrumbSchema) schemas.push(breadcrumbSchema);
  const faqSchema = buildFAQSchema(faqs, PATH);
  if (faqSchema) schemas.push(faqSchema);

  return (
    <>
      <StructuredData data={schemas} />

      <PageHero
        crumbs={breadcrumbItems}
        icon="brush"
        eyebrow="Cleanings & exams"
        title={
          <>
            Teeth cleanings and exams in <em>Palo Alto</em>
          </>
        }
        lead="Thorough, gentle hygiene visits with our long-time hygienists, paired with an exam from Dr. Christopher B. Wong, so small issues stay small."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="cleaning-hero"
        chips={["PPO benefits checked first"]}
        media={
          <ServicePhoto
            src={HERO_IMAGE}
            alt="Two dental team members share a laugh while reviewing a chart in a treatment room"
            focus="55% 45%"
            aspect="aspect-[16/10] lg:aspect-[6/5]"
            badge={
              <PhotoBadge icon="brush" title="Long-time hygienists">
                Angelisa has cared for patients here since 2008.
              </PhotoBadge>
            }
          />
        }
      />

      <Section id="cleaning-overview" tone="white" className="pt-10 sm:pt-14 lg:pt-16" labelledBy="cleaning-fit-title">
        <JumpNav
          items={[
            { href: "#cleaning-overview", label: "Is it time?" },
            { href: "#cleaning-visit", label: "Your visit" },
            { href: "#deep-cleaning", label: "Deep cleaning" },
            { href: "#cleaning-cost", label: "Cost & insurance" },
            { href: "#cleaning-faq", label: "FAQ" },
          ]}
        />
        <ReviewedBy date="2026-10-16" className="mt-7" />
        <QuickFacts facts={facts} className="mt-5" />

        <FitAndDefinition
          className="mt-12 lg:mt-20"
          fitId="cleaning-fit-title"
          fitTitle={
            <>
              Is it time for <em>a cleaning?</em>
            </>
          }
          signs={[
            "It’s been six months or more since your last cleaning",
            "Your gums bleed when you brush or floss",
            "Bad breath that doesn’t go away",
            "Food catches between teeth, or you can see tartar or stains",
            "You’re planning whitening or Invisalign (start with a cleaning)",
          ]}
          whatId="what-is-a-cleaning"
          whatTitle="What happens at a teeth cleaning?"
        >
          <p>
            A professional cleaning removes the plaque, hardened tartar, and surface stains that brushing misses. Even
            if you brush and floss consistently, bacteria collect under the gumline, and that buildup is what leads to
            cavities, gum inflammation, and bad breath.
          </p>
          <p>
            At our Palo Alto practice every cleaning is paired with an exam from Dr. Wong, so you leave knowing exactly
            what’s going on while small issues are still simple to treat.
          </p>
        </FitAndDefinition>
      </Section>

      <Section id="cleaning-visit" tone="cream" labelledBy="cleaning-visit-title">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:grid-rows-[auto_1fr] lg:gap-x-16">
          <SectionHeading
            id="cleaning-visit-title"
            eyebrow="Your visit, step by step"
            title={
              <>
                What’s included in <em>your visit</em>
              </>
            }
          />
          <Steps steps={visitSteps} className="lg:col-start-2 lg:row-span-2 lg:row-start-1" />
          <GuideLinks
            className="lg:col-start-1 lg:row-start-2"
            columns={1}
            title="Guides from our blog"
            guides={[
              {
                href: "/blog/bleeding-gums-when-flossing-palo-alto",
                title: "Bleeding gums when flossing: what it means",
              },
              {
                href: "/blog/food-gets-stuck-between-teeth-palo-alto",
                title: "Why does food keep getting stuck between my teeth?",
              },
            ]}
          />
        </div>

        <div id="deep-cleaning" className="mt-14 scroll-mt-24 sm:mt-20">
          <SectionHeading
            title={
              <>
                Routine cleaning or <em>deep cleaning?</em>
              </>
            }
            lead="A routine cleaning is for healthy gums; a deep cleaning treats gum infection. We’ll tell you which is appropriate after your exam."
          />
          <SpokeCards items={cleaningTypes} columns={2} className="mt-7" />
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <Disclosure title="When a deep cleaning is the right next step">
              <p>
                Sometimes we see inflammation or deeper plaque buildup that a routine cleaning can’t fully remove. A
                deep cleaning, also called scaling and root planing, gently clears bacteria from below the gumline and
                smooths the root surfaces so your gums can heal and reattach.
              </p>
              <p>
                We’ll explain what we’re seeing, how many visits it may take, and how we’ll keep you comfortable. The
                goal is to stabilize gum health early so you can return to simple maintenance visits and avoid
                long-term periodontal issues.
              </p>
            </Disclosure>
            <Disclosure title="A preventive approach for busy families">
              <p>
                We’re a family-friendly practice and see many patients from the same household. We keep your schedule
                simple and your care predictable, with cleaning intervals based on each person’s risk factors. Kids are
                welcome too: see <Link href="/pediatric-dentistry">children’s dentistry</Link>.
              </p>
              <p>
                Interested in whitening or Invisalign? Cleanings are the best place to start: a clean, healthy
                foundation helps cosmetic results look better and last longer.
              </p>
            </Disclosure>
          </div>
        </div>

        <div className="mt-14 sm:mt-20">
          <h3 className="h-card text-[1.45rem] sm:text-[1.7rem]">
            Comfort and <em>technology</em>
          </h3>
          <IconPoints items={comfort} columns={4} rail headingLevel="h4" className="mt-5" />
        </div>
      </Section>

      <CostPanel
        id="cleaning-cost"
        title={
          <>
            Cleaning cost and <em>insurance</em>
          </>
        }
        lead="Cleanings and exams are preventive care, which most PPO plans cover. We verify your benefits first, so you know your portion up front."
        drivers={[
          "A routine cleaning or a deep cleaning",
          "Whether X-rays are due at this visit",
          "How many areas need deeper care",
          "Your plan’s preventive benefits and visit frequency",
        ]}
        coverage="Deep cleaning is often covered differently from a routine cleaning."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="cleaning-cost"
      />

      <ServiceReviews
        tags={["cleaning"]}
        title={
          <>
            Thorough, friendly <em>cleanings</em>
          </>
        }
      />

      <WhoTreats
        teamSlugs={["angelisa", "helen", "kaye"]}
        intro="Our registered dental hygienists handle your cleaning. Dr. Wong does your exam, explains what he sees in plain language, and recommends treatment only when it’s needed."
      />

      <div id="cleaning-faq" className="scroll-mt-24">
        <FAQSection
          title="Dental cleaning FAQs"
          subtitle="Quick answers about frequency, comfort, and deep cleaning."
          items={faqs}
        />
      </div>

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="Other preventive and restorative care at our Palo Alto office."
      />
      <NearbyLine />

      <CtaBand
        analyticsContext="cleaning-cta"
        showSteps={false}
        title={
          <>
            Due for <em>a cleaning?</em>
          </>
        }
        lead="Request a visit online in about a minute, or call the front desk. We’ll check your benefits first and find a time that fits your week."
      />
    </>
  );
};

export default DentalCleaningPaloAlto;
