import StructuredData from "@/components/seo/StructuredData";
import { CtaBand } from "@/components/ds/CtaBand";
import { FaqList } from "@/components/ds/FaqList";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { HomeHero } from "@/components/home/HomeHero";
import {
  CareFinder,
  CostSection,
  FeaturedQuote,
  OfficeSection,
  ReviewRibbon,
  StorySection,
  TeamSection,
  VisitSection,
} from "@/components/home/HomeSections";
import { TreatTipsSection } from "@/components/seasonal/HomeSeasonal";
import { buildFAQSchema, type FAQEntry } from "@/lib/structuredData";

const homeFaqs: FAQEntry[] = [
  {
    question: "Are you accepting new patients?",
    answer:
      "Yes—new patients are welcome. We’ll start with a thorough exam and a clear conversation about your goals, concerns, and the next best steps.",
  },
  {
    question: "Do you accept dental insurance?",
    answer:
      "We work with most major PPO dental insurance plans as an out-of-network provider. Share your plan information and our team will help verify benefits and walk through expected costs before you commit to treatment.",
  },
  {
    question: "What if I have a dental emergency?",
    answer:
      "If you have significant pain, swelling, or a broken tooth, call our office as soon as possible. We’ll help you understand what to do next and schedule urgent care when available.",
  },
  {
    question: "How do I schedule an appointment?",
    answer:
      "You can request an appointment online or call our office. We’ll confirm a time and help you prepare for your first visit.",
  },
];

const Home = () => {
  const faqSchema = buildFAQSchema(homeFaqs, "/");

  return (
    <>
      <StructuredData data={faqSchema ? [faqSchema] : []} />
      <HomeHero />
      <ReviewRibbon />
      <CareFinder />
      <StorySection />
      <TeamSection />
      <FeaturedQuote />
      <OfficeSection />
      <CostSection />
      <TreatTipsSection />
      <VisitSection />
      <Section id="faq" tone="cream" labelledBy="faq-title">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            id="faq-title"
            eyebrow="Questions"
            title={
              <>
                Palo Alto dentist <em>FAQs</em>
              </>
            }
            lead="Quick answers about visiting our office, insurance, and scheduling."
          />
          <FaqList items={homeFaqs} />
        </div>
      </Section>
      <CtaBand analyticsContext="home-cta" />
    </>
  );
};

export default Home;
