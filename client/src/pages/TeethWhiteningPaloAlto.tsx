import Link from "next/link";
import { CalendarCheck, CheckCircle2, Clock, Hourglass, ShieldCheck, Smile, Stethoscope, XCircle } from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import FAQSection from "@/components/common/FAQSection";
import RelatedServices, { type RelatedServiceLink } from "@/components/common/RelatedServices";
import { CtaBand } from "@/components/ds/CtaBand";
import type { Fact } from "@/components/ds/FactGrid";
import { PageHero } from "@/components/ds/PageHero";
import { ReviewedBy } from "@/components/ds/ReviewedBy";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { ServiceIcon } from "@/components/ds/ServiceIcon";
import { ServiceReviews } from "@/components/ds/ServiceReviews";
import type { Step } from "@/components/ds/Steps";
import { WhoTreats } from "@/components/ds/WhoTreats";
import { CompareTable, type CompareRow } from "@/components/services/CompareTable";
import { CostPanel } from "@/components/services/CostPanel";
import { Disclosure, DotList } from "@/components/services/Disclosure";
import { FeatureGrid, type Feature } from "@/components/services/FeatureList";
import { FitChecklist } from "@/components/services/FitChecklist";
import { GuideLinks } from "@/components/services/GuideLinks";
import { JumpNav } from "@/components/services/JumpNav";
import { NearbyLine } from "@/components/services/NearbyLine";
import { QuickFacts } from "@/components/services/QuickFacts";
import { PhotoBadge, ServicePhoto } from "@/components/services/ServicePhoto";
import { StepList } from "@/components/services/StepList";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildServiceSchema,
  type FAQEntry,
  type StructuredDataNode,
} from "@/lib/structuredData";

const PATH = "/teeth-whitening-palo-alto";
const SCHEDULE_HREF = "/schedule?intent=whitening&source=teeth-whitening-page#appointment";
const HERO_IMAGE = "/images/redesign/dr-wong-atrium-smile-portrait.webp";
const ZOOM_IMAGE = "/images/redesign/office-treatment-room.webp";

const faqs: FAQEntry[] = [
  {
    question: "Is professional teeth whitening safe?",
    answer:
      "Yes. We evaluate your teeth and gums first, then use dentist‑supervised whitening gel and controlled light or take‑home trays to brighten safely without harming enamel.",
  },
  {
    question: "How long do whitening results last?",
    answer:
      "Most patients enjoy results for 12–24 months. The exact timeline depends on coffee/tea, red wine, tobacco, and how consistently you follow home care.",
  },
  {
    question: "Will whitening make my teeth sensitive?",
    answer:
      "Mild sensitivity is common for a day or two. We tailor the strength and timing to your comfort and can recommend desensitizing toothpaste or in‑office fluoride.",
  },
  {
    question: "What’s the difference between ZOOM whitening and store‑bought kits?",
    answer:
      "In‑office whitening uses higher‑quality gel and professional isolation, so you see a bigger change faster and with less risk of irritation. Store kits can help, but they’re less predictable.",
  },
  {
    question: "Can crowns or veneers be whitened?",
    answer:
      "No. Whitening only changes natural enamel. If you have visible restorations, we’ll plan whitening first and then match new restorations to your brighter shade if needed.",
  },
];

const facts: readonly Fact[] = [
  { icon: Clock, label: "ZOOM! in-office", value: "One visit, about 90 minutes" },
  { icon: CalendarCheck, label: "Take-home trays", value: "Gradual, at your own pace" },
  { icon: Hourglass, label: "Results last", value: "Often 12–24 months" },
  { icon: Stethoscope, label: "Supervised by", value: "Dr. Wong, after a quick exam" },
];

const canHelpWith = [
  "Yellowing from coffee/tea, wine, or aging",
  "A brighter shade across natural enamel",
  "Improving your smile before Invisalign or cosmetic finishing",
] as const;

const cannotChange = [
  "The color of crowns, veneers, or tooth‑colored fillings",
  "Severe internal stains in every situation (we’ll discuss alternatives)",
  "Uneven brightness if existing restorations are visible (planning helps)",
] as const;

const zoomPerks: readonly Feature[] = [
  {
    icon: Clock,
    title: "Visible in one visit",
    body: "Up to eight shades brighter in a single 90-minute appointment, depending on your starting shade.",
  },
  {
    icon: ShieldCheck,
    title: "Minimized sensitivity",
    body: "Protective gel, desensitizing agents, and careful light settings keep you comfortable.",
  },
  {
    icon: Smile,
    title: "Even, natural results",
    body: "Customized shade goals brighten your smile without looking artificial.",
  },
];

const zoomSteps: readonly Step[] = [
  {
    title: "Shade goal & exam",
    meta: "Start of the visit",
    body: "We confirm your whitening goals, check for decay or cracks, and take shade photos so we can measure improvement.",
  },
  {
    title: "Prep & protection",
    body: "We isolate your lips and gums, then apply a protective gel to keep soft tissue safe.",
  },
  {
    title: "ZOOM! light sessions",
    meta: "Three to four 15-minute cycles",
    body: "ZOOM! whitening gel with controlled light activation. If you’re prone to sensitivity, we can adjust concentration or timing.",
  },
  {
    title: "Fluoride & post-care",
    body: "Sensitivity care, a final shade check, and home care plus foods to avoid for the first 24–48 hours.",
  },
];

const sensitivityPlan = [
  "Start with an exam so whitening is safe for enamel and gums",
  "Tailor gel strength and timing based on your sensitivity history",
  "Use desensitizing steps and fluoride when helpful",
  "Share a 24–48 hour post-care plan to reduce sensitivity triggers",
] as const;

const compareRows: readonly CompareRow[] = [
  {
    label: "Best for",
    values: [
      "A noticeable change quickly, like before an event or photos",
      "A slower change, touch-ups, or teeth prone to sensitivity",
    ],
  },
  {
    label: "How it works",
    values: [
      "Gums isolated, then professional gel with controlled light activation",
      "Custom-fit trays with professional gel and clear instructions",
    ],
  },
  {
    label: "Time",
    values: ["One visit of about 90 minutes", "Gradual, on your schedule at home"],
  },
  {
    label: "Comfort",
    values: [
      "Strength and timing tailored to reduce irritation",
      "Precise fit keeps gel where it belongs",
    ],
  },
  {
    label: "Upkeep",
    values: ["Pair with trays to maintain", "Occasional touch-ups without starting over"],
  },
];

const costFactors = [
  "Whether you choose in‑office whitening, take‑home trays, or both",
  "How much staining and shade change you’re aiming for",
  "Sensitivity considerations that affect strength and timing",
  "Whether you have restorations that may need to be color-matched afterward",
  "Insurance/FSA/HSA considerations (most whitening is cosmetic)",
] as const;

const relatedServices: RelatedServiceLink[] = [
  {
    href: "/dental-veneers",
    anchorText: "Dental veneers",
    description: "Cover deep stains that don’t respond to whitening, or reshape teeth.",
  },
  {
    href: "/invisalign",
    anchorText: "Invisalign clear aligners",
    description: "Straighten teeth first, then finish with whitening.",
  },
  {
    href: "/dental-cleaning-palo-alto",
    anchorText: "Cleanings and exams",
    description: "Regular cleanings remove surface stains and keep your shade stable.",
  },
];

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Teeth whitening", path: PATH },
];

const TeethWhiteningPaloAlto = () => {
  const schemas: StructuredDataNode[] = [
    buildServiceSchema({
      name: "Teeth Whitening",
      pageName: "Teeth whitening in Palo Alto, in-office ZOOM! or take-home",
      description:
        "Dentist-supervised teeth whitening in Palo Alto: one-visit ZOOM! in-office whitening or custom take-home trays, tailored to your shade goal and sensitivity level.",
      slug: PATH,
      image: HERO_IMAGE,
      serviceType: "Teeth Whitening",
      procedure: {
        name: "Professional teeth whitening (ZOOM! in-office or custom take-home trays)",
        procedureType: "Noninvasive",
        bodyLocation: "Teeth",
        howPerformed:
          "Dentist-supervised whitening gel is applied either in the office, with lips and gums isolated and controlled light activation (ZOOM!), or at home in custom-fit trays.",
        preparation: "An exam to confirm teeth and gums are healthy; decay, worn enamel, or gum inflammation is treated first.",
        followup: "Sensitivity care and a 24–48 hour post-care plan; take-home trays can maintain the shade.",
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
        icon="whitening"
        eyebrow="Professional teeth whitening"
        title={
          <>
            Teeth whitening in Palo Alto, <em>in-office ZOOM! or take-home</em>
          </>
        }
        lead="Dentist-supervised whitening tailored to your goals and sensitivity level: a one-visit ZOOM! session, custom take-home trays, or both, so you get a brighter smile without guessing."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="whitening-hero"
        chips={["Exam first, for enamel and gums"]}
        media={
          <ServicePhoto
            src={HERO_IMAGE}
            alt="Dr. Christopher B. Wong smiling in the office atrium"
            focus="50% 30%"
            aspect="aspect-[4/3] sm:aspect-[16/11] lg:aspect-[5/6]"
            badge={
              <PhotoBadge icon="whitening" title="A shade that looks like you">
                Natural-looking goals and clear expectations, set together.
              </PhotoBadge>
            }
          />
        }
      />

      <Section id="whitening-candidacy" tone="white" labelledBy="whitening-candidacy-title">
        <JumpNav
          items={[
            { href: "#whitening-candidacy", label: "Is it right for me?" },
            { href: "#zoom-whitening", label: "ZOOM! in-office" },
            { href: "#whitening-options", label: "In-office vs take-home" },
            { href: "#whitening-cost", label: "Cost" },
            { href: "#whitening-faq", label: "FAQ" },
          ]}
        />
        <QuickFacts facts={facts} className="mt-6" />
        <ReviewedBy date="2026-10-16" className="mt-5" />

        <div className="mt-12 grid gap-8 lg:mt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            id="whitening-candidacy-title"
            eyebrow="Is it right for you?"
            title={
              <>
                Is whitening right <em>for you?</em>
              </>
            }
            lead="Whitening works best when teeth and gums are healthy. We’ll confirm candidacy first and then recommend the safest plan to reach a natural shade goal."
          />
          <FitChecklist
            good={[
              "Coffee, tea, red wine, or aging-related surface stains",
              "A refresh before a big event or photos",
              "Patients who want safer, more predictable results than store kits",
            ]}
            plan={[
              "Visible crowns, veneers, or bonding on front teeth (these don’t whiten)",
              "Very deep internal discoloration where veneers may be a better match",
              "Active decay or gum inflammation (we’ll treat this first)",
            ]}
            note="If you have front‑tooth restorations and want a brighter look, we can discuss whitening first and then matching new restorations to the brighter shade."
          />
        </div>
      </Section>

      <Section id="what-is-whitening" tone="cream" labelledBy="what-is-whitening-title">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
          <div>
            <SectionHeading
              id="what-is-whitening-title"
              eyebrow="The basics"
              title={
                <>
                  How professional whitening <em>works</em>
                </>
              }
            />
            <div className="prose-rooted mt-5 space-y-4">
              <p>
                Professional teeth whitening brightens natural enamel with dentist-supervised whitening gel. If your
                smile feels a little dull from coffee, tea, red wine, or natural aging, it’s one of the fastest ways to
                look refreshed.
              </p>
              <p>
                We start with a quick evaluation to confirm whitening is a good fit. If there’s decay, worn enamel, or
                gum inflammation, we’ll address that first so whitening feels comfortable and lasts longer. Then you
                choose a one-visit ZOOM! session, custom take-home trays, or a combination of both.
              </p>
            </div>
          </div>
          <div className="card overflow-hidden">
            <p className="border-b border-cream-300/80 px-5 py-4 text-[15px] leading-6 text-ink-soft sm:px-6">
              Whitening brightens natural enamel. If you have visible restorations (like veneers, crowns, or bonding)
              we plan the sequence so your final shade looks even.
            </p>
            <div className="grid divide-y divide-cream-300/80 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="p-5 sm:p-6">
                <h3 className="h-card text-[1.15rem]">Whitening can help with</h3>
                <ul className="mt-3 space-y-2.5">
                  {canHelpWith.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[15px] leading-6 text-ink-soft">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-evergreen-600" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="h-card text-[1.15rem]">Whitening can’t change</h3>
                <ul className="mt-3 space-y-2.5">
                  {cannotChange.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[15px] leading-6 text-ink-soft">
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="zoom-whitening" tone="white" labelledBy="zoom-whitening-title">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              id="zoom-whitening-title"
              eyebrow="ZOOM! in-office whitening"
              title={
                <>
                  Brighter teeth <em>in one visit</em>
                </>
              }
              lead="Our most popular option is professional in-office whitening with ZOOM!. In a single visit, we isolate the gums, apply professional whitening gel, and use controlled light activation to brighten efficiently, with safeguards that keep teeth healthy and sensitivity low."
            />
          </div>
          <ServicePhoto
            src={ZOOM_IMAGE}
            alt="Treatment room with a dental chair, monitor, and cabinetry"
            focus="50% 50%"
            priority={false}
            aspect="aspect-[16/9]"
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="hidden sm:block"
          />
        </div>
        <FeatureGrid features={zoomPerks} columns={3} rail className="mt-8" />

        <h3 className="h-card mt-12 text-[1.4rem] sm:mt-16 sm:text-[1.75rem]">
          Your ZOOM! visit, <em>step by step</em>
        </h3>
        <StepList steps={zoomSteps} columns={4} className="mt-6" />
        <p className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-gold-300/70 bg-gold-200/40 px-5 py-4 text-[15px] leading-6 text-ink-soft">
          <ServiceIcon name="whitening" className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" animated={false} />
          <span>
            <strong className="font-semibold text-ink">Tip:</strong> avoid coffee, tea, or red wine for 48 hours after
            treatment to lock in your shade.
          </span>
        </p>
      </Section>

      <Section id="whitening-options" tone="cream" labelledBy="whitening-options-title">
        <SectionHeading
          id="whitening-options-title"
          eyebrow="Options"
          title={
            <>
              In-office ZOOM! or <em>take-home trays?</em>
            </>
          }
          lead="Not sure which to choose? Many Palo Alto patients do a “boost + maintain” plan: an in‑office session for a quick jump in brightness, then take‑home trays a few times a year to maintain results."
        />
        <CompareTable
          className="mt-8"
          caption="ZOOM! in-office whitening compared with custom take-home trays"
          columns={[
            { name: "ZOOM! in-office", icon: "whitening", note: "One visit" },
            { name: "Take-home trays", icon: "aligner", note: "Gradual" },
          ]}
          rows={compareRows}
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:gap-5">
          <div className="card p-5 sm:p-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="h-card mt-4 text-[1.25rem]">Sensitivity: what we do to minimize it</h3>
            <p className="mt-1.5 text-[15px] leading-6 text-ink-soft sm:leading-7">
              Some sensitivity is common after whitening, but comfort matters. We tailor your plan and share practical
              post-care so you can keep results without feeling “zingy.”
            </p>
            <DotList className="mt-3 text-[15px] leading-6 text-ink-soft sm:leading-7" items={[...sensitivityPlan]} />
          </div>
          <div className="space-y-3">
            <Disclosure title="Custom take-home trays, in detail">
              <p>
                Great for a slower change, touch‑ups, or patients prone to sensitivity. Trays fit precisely, so gel stays
                where it belongs and results feel more predictable.
              </p>
              <p>
                Want a simple maintenance plan? Ask about take‑home trays so you can do occasional touch‑ups without
                starting from scratch.
              </p>
            </Disclosure>
            <Disclosure title="Keeping your results bright">
              <p>
                Whitening lasts longest when your teeth are healthy and clean. Regular visits for{" "}
                <Link href="/dental-cleaning-palo-alto" className="link-rooted">
                  dental cleanings in Palo Alto
                </Link>{" "}
                help remove surface stains and keep your shade stable. At home, brush twice daily, floss, and consider
                using a whitening toothpaste a few times per week. If you drink staining beverages, rinsing with water
                afterward can make a big difference.
              </p>
            </Disclosure>
            <GuideLinks
              className="pt-3"
              columns={1}
              title="Whitening guides"
              guides={[
                { href: "/blog/zoom-vs-take-home-whitening-palo-alto", title: "ZOOM! vs take-home whitening: which is right for you?" },
                { href: "/blog/teeth-whitening-sensitivity-what-helps", title: "Teeth whitening sensitivity: what helps" },
                { href: "/blog/how-long-does-teeth-whitening-last", title: "How long does teeth whitening last?" },
              ]}
            />
          </div>
        </div>
      </Section>

      <CostPanel
        id="whitening-cost"
        tone="white"
        title={
          <>
            Whitening cost: <em>what to expect</em>
          </>
        }
        lead="Whitening is personalized, so cost depends on your plan and goals. After your evaluation, we’ll explain options and provide a clear estimate before you start."
        drivers={costFactors}
        coverage="Whitening is usually considered cosmetic, so many plans don’t cover it."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="whitening-cost"
      />

      <ServiceReviews
        tags={["gentle", "honest"]}
        note="Reviews about care at our office; none of these mention whitening specifically."
      />

      <WhoTreats
        teamSlugs={["jamal", "rachel"]}
        intro="Dr. Wong checks your teeth and gums first, sets a shade goal with you, and plans strength and timing around your sensitivity so the result looks natural on you."
      />

      <div id="whitening-faq">
        <FAQSection
          title="Teeth whitening FAQs"
          subtitle="Straight answers about safety, sensitivity, and how long results last."
          items={faqs}
        />
      </div>

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="Combine whitening with other smile‑enhancing treatments."
      />
      <NearbyLine subject="Whitening patients" />

      <CtaBand
        analyticsContext="whitening-cta"
        title={
          <>
            Ready for a <em>brighter smile?</em>
          </>
        }
        lead="We’ll help you choose the right whitening plan and reach a shade that looks natural on you. Request a visit online in about a minute, or call our Palo Alto office."
      />
    </>
  );
};

export default TeethWhiteningPaloAlto;
