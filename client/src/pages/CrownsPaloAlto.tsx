import Link from "next/link";
import { CalendarDays, HeartHandshake, Hourglass, Layers, Ruler, ShieldCheck, Sun } from "lucide-react";

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

const PATH = "/crowns-palo-alto";
const SCHEDULE_HREF = "/schedule?intent=restorative&source=crowns-page#appointment";
const HERO_IMAGE = "/images/redesign/jamal-itero-scan.webp";

const faqs: FAQEntry[] = [
  {
    question: "When do I need a crown instead of a filling?",
    answer:
      "Crowns are recommended when a tooth is significantly cracked, heavily filled, or has a large cavity that needs full coverage for strength.",
  },
  {
    question: "How long does the crown process take?",
    answer:
      "Most crowns take two visits: one to prepare the tooth and take impressions, and a second to bond the final crown once it’s fabricated.",
  },
  {
    question: "Are crowns natural‑looking?",
    answer: "Yes. We select materials and shades that match your enamel so your crown blends into your smile.",
  },
  {
    question: "How long do crowns last?",
    answer: "With good hygiene and regular checkups, crowns often last 10–15 years or longer.",
  },
  {
    question: "Will getting a crown hurt?",
    answer:
      "We numb the area thoroughly. You may feel mild soreness afterward, but most patients return to normal activities the same day.",
  },
];

const facts: readonly QuickFact[] = [
  { icon: CalendarDays, label: "Visits", value: "Usually two" },
  { icon: ShieldCheck, label: "In between", value: "A temporary crown protects the tooth" },
  { icon: Hourglass, label: "Lifespan", value: "Often 10–15 years or longer" },
  { icon: Layers, label: "Materials", value: "Chosen for the tooth and your bite" },
];

const visitSteps: readonly Step[] = [
  {
    title: "Prepare the tooth",
    meta: "Visit 1",
    body: "After numbing, we remove any decay or fractures and shape the tooth to fit a crown.",
  },
  {
    title: "Precise impressions",
    meta: "Visit 1",
    body: "Impressions capture your bite so the final crown fits it and matches the teeth beside it.",
  },
  {
    title: "A temporary crown",
    meta: "Between visits",
    body: "A comfortable temporary crown protects the tooth while your custom crown is crafted.",
  },
  {
    title: "Fit, polish, and bond",
    meta: "Visit 2",
    body: "We confirm the fit, polish the contact points, and bond the crown securely. You leave with a tooth that looks and feels natural.",
  },
];

const materials: readonly Spoke[] = [
  {
    title: "Back teeth",
    icon: "crown",
    tag: "Strength first",
    body: "For teeth that handle heavy chewing, we often recommend high-strength ceramic or zirconia.",
  },
  {
    title: "Front teeth",
    icon: "veneer",
    tag: "Lifelike look",
    body: "We prioritize lifelike translucency so your crown blends in with the enamel beside it.",
  },
  {
    title: "The small details",
    icon: "checkup",
    tag: "Custom-made",
    body: "Shade, shape, contour, and how the crown meets the gumline are fine-tuned so it feels like your own tooth.",
  },
];

const comfort: readonly IconPoint[] = [
  {
    icon: HeartHandshake,
    title: "Thorough numbing",
    body: "Mild soreness afterward is normal; most patients return to normal activities the same day.",
  },
  {
    icon: ShieldCheck,
    title: "Protected in between",
    body: "A temporary crown covers the tooth while the final one is made.",
  },
  {
    icon: Ruler,
    title: "Fit and bite checked",
    body: "Contacts are polished and the bite is checked carefully before bonding.",
  },
  {
    icon: Sun,
    title: "Shade-matched",
    body: "Materials and shades are selected to match your enamel.",
  },
];

const relatedServices: RelatedServiceLink[] = [
  {
    href: "/cavity-fillings-palo-alto",
    anchorText: "Tooth-colored fillings",
    description: "For smaller areas of decay that don’t need full coverage.",
  },
  {
    href: "/dental-implants",
    anchorText: "Dental implants",
    description: "Replace a tooth that can’t be restored.",
  },
  {
    href: "/restorative-dentistry",
    anchorText: "Restorative dentistry",
    description: "How fillings, crowns, bridges, and implants fit together.",
  },
];

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Dental crowns", path: PATH },
];

const CrownsPaloAlto = () => {
  const schemas: StructuredDataNode[] = [
    buildServiceSchema({
      name: "Dental Crowns",
      pageName: "Dental crowns in Palo Alto",
      description:
        "Custom dental crowns in Palo Alto to restore cracked, worn, or heavily filled teeth with a natural-looking, durable fit.",
      slug: PATH,
      image: HERO_IMAGE,
      serviceType: "Dental restoration",
      procedure: {
        name: "Dental crown",
        procedureType: "Noninvasive",
        bodyLocation: "Tooth",
        howPerformed:
          "The tooth is numbed, decay or fractures are removed, and the tooth is shaped and recorded with precise impressions; a temporary crown protects it until the custom crown is fitted, polished, and bonded.",
        preparation: "An exam and imaging to confirm a filling would not be strong enough to protect the tooth.",
        followup: "Brush and floss normally, keep regular checkups, and consider a night guard if you grind your teeth.",
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
        icon="crown"
        eyebrow="Crowns"
        title={
          <>
            Dental crowns in <em>Palo Alto</em>
          </>
        }
        lead="A custom crown protects a tooth weakened by decay, cracks, or past dental work. Dr. Christopher B. Wong designs each one to feel comfortable, look natural, and restore confident chewing."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="crowns-hero"
        chips={["PPO benefits checked first"]}
        media={
          <ServicePhoto
            src={HERO_IMAGE}
            alt="Jamal, registered dental assistant, reviewing a digital scan on the iTero screen"
            focus="40% 40%"
            aspect="aspect-[16/10] lg:aspect-[6/5]"
            badge={
              <PhotoBadge icon="crown" title="Fit and bite checked carefully">
                Shade, shape, and contour fine-tuned to feel like your own tooth.
              </PhotoBadge>
            }
          />
        }
      />

      <Section id="crowns-overview" tone="white" className="pt-10 sm:pt-14 lg:pt-16" labelledBy="crowns-fit-title">
        <JumpNav
          items={[
            { href: "#crowns-overview", label: "Do I need one?" },
            { href: "#crowns-visit", label: "Two visits" },
            { href: "#crowns-materials", label: "Materials & care" },
            { href: "#crowns-cost", label: "Cost & insurance" },
            { href: "#crowns-faq", label: "FAQ" },
          ]}
        />
        <ReviewedBy date="2026-10-16" className="mt-7" />
        <QuickFacts facts={facts} className="mt-5" />

        <FitAndDefinition
          className="mt-12 lg:mt-20"
          fitId="crowns-fit-title"
          fitTitle={
            <>
              Do you need <em>a crown?</em>
            </>
          }
          signs={[
            "A cracked or broken tooth",
            "A large cavity that needs full coverage for strength",
            "A tooth that’s been heavily filled",
            "A crown that’s worn, loose, or has fallen off",
            "A tooth that’s had a root canal",
          ]}
          signsNote={
            <>
              Not sure? Read{" "}
              <Link href="/blog/crown-vs-filling-palo-alto" className="link-rooted">
                crown vs filling
              </Link>
              , or let your exam decide.
            </>
          }
          whatId="what-is-a-crown"
          whatTitle="What is a dental crown?"
        >
          <p>
            A dental crown is a custom-made cap that covers a tooth weakened by decay, cracks, or previous dental work.
            We recommend one when a filling wouldn’t be strong enough to protect the remaining tooth.
          </p>
          <p>
            A crown acts like a durable cap over the tooth, sealing out bacteria and distributing bite forces evenly,
            and it’s shaded and shaped to blend in with the teeth around it.
          </p>
        </FitAndDefinition>
      </Section>

      <Section id="crowns-visit" tone="cream" labelledBy="crowns-visit-title">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:grid-rows-[auto_1fr] lg:gap-x-16">
          <SectionHeading
            id="crowns-visit-title"
            eyebrow="Your visits, step by step"
            title={
              <>
                Two visits, <em>one natural tooth</em>
              </>
            }
          />
          <Steps steps={visitSteps} className="lg:col-start-2 lg:row-span-2 lg:row-start-1" />
          <GuideLinks
            className="lg:col-start-1 lg:row-start-2"
            columns={1}
            title="Guides from our blog"
            guides={[
              { href: "/blog/crown-fell-off-palo-alto", title: "What to do if a crown falls off" },
              {
                href: "/blog/do-you-need-a-crown-after-a-root-canal-palo-alto",
                title: "Do you need a crown after a root canal?",
              },
              {
                href: "/blog/bite-feels-off-after-filling-or-crown-palo-alto",
                title: "Why does my bite feel off after a crown?",
              },
            ]}
          />
        </div>

        <div className="mt-14 sm:mt-20">
          <h3 className="h-card text-[1.45rem] sm:text-[1.7rem]">
            Comfort and <em>fit</em>
          </h3>
          <IconPoints items={comfort} columns={4} rail headingLevel="h4" className="mt-5" />
        </div>
      </Section>

      <Section id="crowns-materials" tone="white" labelledBy="crowns-materials-title">
        <SectionHeading
          id="crowns-materials-title"
          eyebrow="Options & materials"
          title={
            <>
              Materials chosen for strength <em>and a natural look</em>
            </>
          }
          lead="We’ll talk through material options based on the tooth, your bite, and your cosmetic goals."
        />
        <SpokeCards items={materials} columns={3} rail className="mt-8" />
        <Disclosure title="Caring for your crown" className="mt-4">
          <p>
            Crowns are strong, but they rely on healthy gums and good home care. Brush and floss normally, paying
            attention to the gumline. If you grind your teeth at night, a protective guard can extend the life of your
            crown (see our{" "}
            <Link href="/blog/night-guard-teeth-grinding-palo-alto">night guard guide</Link>).
          </p>
          <p>
            If you ever feel a new rough edge, notice lingering sensitivity, or think your bite has changed, let us
            know right away. Early adjustments are simple and help your crown last for many years. If a crown comes
            off, call us; see <Link href="/emergency-dental">emergency dental care</Link>.
          </p>
        </Disclosure>
      </Section>

      <CostPanel
        id="crowns-cost"
        title={
          <>
            Crown cost and <em>insurance</em>
          </>
        }
        lead="You’ll get a clear estimate before treatment. We verify your PPO benefits first and explain your portion."
        drivers={[
          "The material chosen for the tooth",
          "Whether decay or a fracture must be treated first",
          "How many teeth need crowns",
          "Your plan’s benefits for major care",
        ]}
        coverage="Many plans list crowns as major care, often covered at a lower percentage than basic care."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="crowns-cost"
      />

      <ServiceReviews
        tags={["honest", "gentle"]}
        title={
          <>
            Care patients <em>trust</em>
          </>
        }
        note="Reviews about care at our office generally, not crowns specifically."
      />

      <WhoTreats
        teamSlugs={["jamal", "rachel"]}
        intro="Dr. Wong prepares and fits your crown, checking shade, contour, and bite until it feels like your own tooth."
      />

      <div id="crowns-faq" className="scroll-mt-24">
        <FAQSection title="Crown FAQs" subtitle="Timing, comfort, appearance, and lifespan." items={faqs} />
      </div>

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="Other ways to repair or replace a tooth."
      />
      <NearbyLine />

      <CtaBand
        analyticsContext="crowns-cta"
        showSteps={false}
        title={
          <>
            Cracked tooth or <em>worn crown?</em>
          </>
        }
        lead="Request a crown consultation online in about a minute, or call the front desk. If a tooth broke or a crown came off, call and we’ll help as soon as we can."
      />
    </>
  );
};

export default CrownsPaloAlto;
