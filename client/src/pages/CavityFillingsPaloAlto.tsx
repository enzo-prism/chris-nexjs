import Link from "next/link";
import { CalendarClock, HeartHandshake, Hourglass, Palette, Ruler, Smile, Sprout } from "lucide-react";

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

const PATH = "/cavity-fillings-palo-alto";
const SCHEDULE_HREF = "/schedule?intent=restorative&source=fillings-page#appointment";
const HERO_IMAGE = "/images/redesign/patient-thumbs-up-dental-chair.webp";

const faqs: FAQEntry[] = [
  {
    question: "Do you use tooth‑colored fillings?",
    answer:
      "Yes. We primarily use composite fillings that blend naturally with your enamel and bond securely to the tooth.",
  },
  {
    question: "How long do fillings last?",
    answer:
      "Most composite fillings last 7–12 years with good home care. Their lifespan depends on bite forces, tooth location, and diet.",
  },
  {
    question: "Will a filling hurt?",
    answer:
      "We numb the area thoroughly and work conservatively. Most patients feel only pressure, not pain, during the procedure.",
  },
  {
    question: "What happens if I wait on a cavity?",
    answer:
      "Decay spreads over time. A small filling today can turn into a crown or root canal later, so earlier treatment is simpler and more affordable.",
  },
  {
    question: "Can a filling be replaced if it chips or stains?",
    answer:
      "Absolutely. We can repair or replace older fillings if they weaken, leak, or no longer match your smile.",
  },
];

const facts: readonly QuickFact[] = [
  { icon: Palette, label: "Material", value: "Tooth-colored composite" },
  { icon: CalendarClock, label: "Visit", value: "Usually one quick visit" },
  { icon: Hourglass, label: "Lifespan", value: "Often 7–12 years with good care" },
  { icon: Smile, label: "Afterward", value: "Back to work or school right after" },
];

const visitSteps: readonly Step[] = [
  {
    title: "Exam and imaging",
    body: "A careful exam, with digital imaging when needed, shows the size and location of the decay.",
  },
  {
    title: "Gentle numbing",
    body: "We numb the tooth thoroughly and isolate it to keep the area dry. Sensitive or anxious? Tell us, and we’ll work at a pace that keeps you relaxed.",
  },
  {
    title: "Remove decay, rebuild in layers",
    body: "We remove only the softened, decayed enamel, then rebuild the tooth in small layers, curing each one for a strong bond.",
  },
  {
    title: "Bite check and polish",
    body: "We refine your bite and polish the filling so it feels smooth when you chew. Most appointments are quick.",
  },
];

const options: readonly Spoke[] = [
  {
    title: "Tooth-colored composite",
    icon: "filling",
    tag: "What we use",
    body: "Modern composite matches the shade of your tooth and supports natural chewing forces.",
    points: ["Bonds to enamel, so more healthy tooth stays", "Shaded to blend in", "Shaped and polished for a smooth bite"],
  },
  {
    title: "Replacing old fillings",
    icon: "tooth",
    tag: "Repair or replace",
    body: "Older fillings, including silver ones, can be repaired or replaced if they weaken, leak, or no longer match your smile.",
    href: "/blog/should-you-replace-old-silver-fillings-palo-alto",
    linkLabel: "Should you replace silver fillings?",
  },
  {
    title: "When a crown is safer",
    icon: "crown",
    tag: "Larger damage",
    body: "If decay spreads too far, a filling may not be strong enough, and a crown becomes the safer option.",
    href: "/crowns-palo-alto",
    linkLabel: "About dental crowns",
  },
];

const comfort: readonly IconPoint[] = [
  {
    icon: HeartHandshake,
    title: "Thorough, gentle numbing",
    body: "Most patients feel only pressure, not pain.",
  },
  {
    icon: Sprout,
    title: "Conservative removal",
    body: "Only the decayed part comes out; healthy structure stays.",
  },
  {
    icon: Palette,
    title: "Shade-matched",
    body: "Composite is matched to your enamel so it blends in.",
  },
  {
    icon: Ruler,
    title: "Bite adjusted for comfort",
    body: "We refine and polish until your bite feels smooth.",
  },
];

const relatedServices: RelatedServiceLink[] = [
  {
    href: "/crowns-palo-alto",
    anchorText: "Dental crowns",
    description: "For larger cavities or cracked teeth that need full coverage.",
  },
  {
    href: "/restorative-dentistry",
    anchorText: "Restorative dentistry",
    description: "How fillings, crowns, bridges, and implants fit together.",
  },
  {
    href: "/dental-cleaning-palo-alto",
    anchorText: "Teeth cleanings and exams",
    description: "Prevent cavities with regular professional care.",
  },
];

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Tooth-colored fillings", path: PATH },
];

const CavityFillingsPaloAlto = () => {
  const schemas: StructuredDataNode[] = [
    buildServiceSchema({
      name: "Cavity Fillings",
      pageName: "Tooth-colored fillings in Palo Alto",
      description:
        "Tooth-colored composite cavity fillings in Palo Alto — comfortable, conservative treatment for small to moderate decay.",
      slug: PATH,
      image: HERO_IMAGE,
      serviceType: "Dental restoration",
      procedure: {
        name: "Composite (tooth-colored) dental filling",
        procedureType: "Noninvasive",
        bodyLocation: "Tooth",
        howPerformed:
          "After numbing, the decayed portion of the tooth is removed and the tooth is rebuilt in thin layers of composite resin, each cured for a strong bond, then shaped and polished.",
        followup: "Eat normally once numbness wears off, avoid very sticky foods on the first day, and keep regular cleanings.",
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
        icon="filling"
        eyebrow="Cavity fillings"
        title={
          <>
            Tooth-colored fillings in <em>Palo Alto</em>
          </>
        }
        lead="Cavities are common, and treating them early keeps your smile strong. Dr. Christopher B. Wong places conservative composite fillings that blend in with your enamel."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="fillings-hero"
        chips={["PPO benefits checked first"]}
        media={
          <ServicePhoto
            src={HERO_IMAGE}
            alt="A smiling patient gives a thumbs-up in the dental chair with Dr. Wong and an assistant"
            focus="50% 40%"
            aspect="aspect-[16/11] lg:aspect-[5/6]"
            badge={
              <PhotoBadge icon="filling" title="Numbing done gently">
                Most patients feel only pressure, not pain.
              </PhotoBadge>
            }
          />
        }
      />

      <Section id="fillings-overview" tone="white" className="pt-10 sm:pt-14 lg:pt-16" labelledBy="fillings-fit-title">
        <JumpNav
          items={[
            { href: "#fillings-overview", label: "Signs" },
            { href: "#fillings-visit", label: "Your visit" },
            { href: "#fillings-options", label: "Options" },
            { href: "#fillings-cost", label: "Cost & insurance" },
            { href: "#fillings-faq", label: "FAQ" },
          ]}
        />
        <ReviewedBy date="2026-10-16" className="mt-7" />
        <QuickFacts facts={facts} className="mt-5" />

        <FitAndDefinition
          className="mt-12 lg:mt-20"
          fitId="fillings-fit-title"
          fitTitle={
            <>
              Signs you may <em>need a filling</em>
            </>
          }
          signs={[
            "Sensitivity to cold or sweets",
            "A rough edge you can feel with your tongue",
            "Food catching between teeth",
            "An old filling that has chipped, stained, or worn",
            "A cavity found on X-rays, even with no symptoms",
          ]}
          signsNote="Sometimes there are no symptoms at all, which is why cleanings and exams matter."
          whatId="what-is-a-filling"
          whatTitle="What is a tooth-colored filling?"
        >
          <p>
            A cavity starts when bacteria wear through the outer enamel. At first it may not hurt, which is why routine
            exams and X-rays matter.
          </p>
          <p>
            A tooth-colored (composite) filling repairs it: we remove only the damaged portion and rebuild the tooth
            with composite resin that bonds to the structure underneath and matches your enamel. Because composite
            bonds to the tooth, more healthy structure stays than with older metal fillings.
          </p>
        </FitAndDefinition>
      </Section>

      <Section id="fillings-visit" tone="cream" labelledBy="fillings-visit-title">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:grid-rows-[auto_1fr] lg:gap-x-16">
          <SectionHeading
            id="fillings-visit-title"
            eyebrow="Your visit, step by step"
            title={
              <>
                What a filling visit <em>is like</em>
              </>
            }
          />
          <Steps steps={visitSteps} className="lg:col-start-2 lg:row-span-2 lg:row-start-1" />
          <div className="space-y-3 lg:col-start-1 lg:row-start-2">
            <Disclosure title="Aftercare and prevention" defaultOpen>
              <p>
                You can eat normally once numbness wears off; avoid very sticky foods on the first day. Mild
                sensitivity can occur for a short time, and we’ll review bite comfort so the tooth feels normal
                quickly.
              </p>
              <p>
                To prevent future cavities, brush twice daily, floss, and keep a steady schedule of{" "}
                <Link href="/dental-cleaning-palo-alto">professional cleanings</Link>.
              </p>
            </Disclosure>
            <GuideLinks
              columns={1}
              title="Guides from our blog"
              guides={[
                { href: "/blog/cracked-filling-palo-alto", title: "What to do if a filling cracks" },
                {
                  href: "/blog/bite-feels-off-after-filling-or-crown-palo-alto",
                  title: "Why does my bite feel off after a filling?",
                },
              ]}
            />
          </div>
        </div>

        <div className="mt-14 sm:mt-20">
          <h3 className="h-card text-[1.45rem] sm:text-[1.7rem]">
            Comfort, <em>start to finish</em>
          </h3>
          <IconPoints items={comfort} columns={4} rail headingLevel="h4" className="mt-5" />
        </div>
      </Section>

      <Section id="fillings-options" tone="white" labelledBy="fillings-options-title">
        <SectionHeading
          id="fillings-options-title"
          eyebrow="Options"
          title={
            <>
              Our approach to <em>tooth-colored fillings</em>
            </>
          }
          lead="We shape and polish each filling so your bite feels comfortable and smooth, and we’ll tell you honestly when a filling isn’t enough."
        />
        <SpokeCards items={options} columns={3} rail className="mt-8" />
      </Section>

      <CostPanel
        id="fillings-cost"
        title={
          <>
            Filling cost and <em>insurance</em>
          </>
        }
        lead="Earlier treatment is simpler and more affordable: a small filling today can avoid a crown or root canal later. We check your PPO benefits first."
        drivers={[
          "The size of the cavity and how many surfaces it involves",
          "How many teeth need fillings",
          "Whether X-rays are needed first",
          "Your plan’s benefits for basic care",
        ]}
        coverage="Many plans cover fillings as basic care."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="fillings-cost"
      />

      <ServiceReviews
        tags={["fillings", "gentle"]}
        title={
          <>
            Fillings, in patients’ <em>words</em>
          </>
        }
      />

      <WhoTreats
        teamSlugs={["jamal"]}
        intro="Dr. Wong numbs gently, removes only the decay, and checks your bite before you leave. If a filling won’t be strong enough, he’ll explain why and what else could work."
      />

      <div id="fillings-faq" className="scroll-mt-24">
        <FAQSection title="Cavity filling FAQs" subtitle="Comfort, lifespan, and what happens if you wait." items={faqs} />
      </div>

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="Other restorative and preventive care at our Palo Alto office."
      />
      <NearbyLine />

      <CtaBand
        analyticsContext="fillings-cta"
        showSteps={false}
        title={
          <>
            Think you have <em>a cavity?</em>
          </>
        }
        lead="Request a visit online in about a minute, or call the front desk. Toothache or a broken filling? Call, and we’ll do our best to see you the same day."
      />
    </>
  );
};

export default CavityFillingsPaloAlto;
