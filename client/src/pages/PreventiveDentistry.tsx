import MetaTags from "@/components/common/MetaTags";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import RelatedServices, { type RelatedServiceLink } from "@/components/common/RelatedServices";
import RelatedServicePosts from "@/components/blog/RelatedServicePosts";
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

const preventiveFaqs: FAQEntry[] = [
  {
    question: "How often should I get a checkup and cleaning?",
    answer:
      "Most patients do well with preventive visits every six months. If you have gum disease, a history of frequent cavities, or implants, we may recommend visits every 3–4 months to keep things stable.",
  },
  {
    question: "What’s included in a preventive appointment?",
    answer:
      "A typical visit includes a professional cleaning, a detailed dental exam, gum health screening, and digital X‑rays when appropriate. We look for early signs of decay, infection, wear, or bite issues so treatment stays simple.",
  },
  {
    question: "Are digital X‑rays safe?",
    answer:
      "Yes. Digital imaging uses significantly less radiation than older film systems. We only take X‑rays at intervals that match your age and risk profile.",
  },
  {
    question: "Can preventive care really prevent bigger problems?",
    answer:
      "Preventive care can’t remove risk entirely, but it dramatically lowers it. Cleanings remove hardened tartar that brushing can’t, and exams help us catch problems early—before they become painful or require more extensive treatment.",
  },
  {
    question: "What if I haven’t seen a dentist in years?",
    answer:
      "You’re not alone. We’ll start with a comfortable, judgment‑free exam and prioritize what matters most for your health. Getting back to routine preventive care is the best first step.",
  },
];

const PreventiveDentistry = () => {
  const seo = getSeoForPath("/preventive-dentistry");

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Preventive Dentistry", path: "/preventive-dentistry" },
  ];

  const preventiveServiceSchema = buildServiceSchema({
    name: "Preventive Dentistry",
    description:
      "Preventive dentistry including exams, cleanings, screenings, and personalized care plans to keep teeth and gums healthy.",
    slug: "/preventive-dentistry",
  });

  const preventiveBreadcrumbs = buildBreadcrumbSchema(breadcrumbItems);
  const preventiveFaqSchema = buildFAQSchema(preventiveFaqs, "/preventive-dentistry");

  const schemas = [preventiveServiceSchema];
  if (preventiveBreadcrumbs) schemas.push(preventiveBreadcrumbs);
  if (preventiveFaqSchema) schemas.push(preventiveFaqSchema);

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/dental-cleaning-palo-alto",
      anchorText: "Dental cleanings in Palo Alto",
      description: "Routine cleanings to remove plaque and tartar.",
    },
    {
      href: "/cavity-fillings-palo-alto",
      anchorText: "Tooth‑colored fillings",
      description: "Conservative restorations when decay is caught early.",
    },
    {
      href: "/invisalign",
      anchorText: "Invisalign clear aligners",
      description: "Straighten teeth after a healthy foundation is in place.",
    },
    {
      href: "/emergency-dental",
      anchorText: "Emergency dental care",
      description: "Same‑day care when pain or trauma strikes.",
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
            Preventive Dentistry in Palo Alto
          </h1>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-3xl mx-auto">
            Preventive dentistry is the simplest way to protect your teeth, avoid
            surprise emergencies, and keep your smile healthy long‑term. Dr. Christopher
            B. Wong and our team focus on thorough, comfortable checkups that catch
            issues early—when they’re easiest to treat.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/schedule#appointment">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Book a checkup
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                Ask a question
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-bold font-heading text-slate-900">
            What preventive care includes
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Each preventive visit combines a professional cleaning with a detailed exam.
            Cleanings remove plaque and hardened tartar that home brushing can’t reach,
            especially around the gumline. During the exam, we check for cavities, gum
            inflammation, bite wear, and early signs of infection or stress fractures.
          </p>
          <p className="text-slate-700 leading-relaxed">
            Digital X‑rays help us see between teeth and under existing restorations.
            When taken at the right intervals, they allow us to treat small cavities
            with a conservative filling rather than waiting until a crown or root canal
            is needed.
          </p>

          <h2 className="text-3xl font-bold font-heading text-slate-900">
            A personalized prevention plan
          </h2>
          <p className="text-slate-700 leading-relaxed">
            No two mouths are the same. We tailor your schedule and recommendations to
            your risk factors—things like dry mouth, diet, past cavities, orthodontic
            history, and gum health. Some patients need standard six‑month visits; others
            do best with shorter intervals to keep inflammation and bacteria controlled.
          </p>
          <p className="text-slate-700 leading-relaxed">
            If you’re working toward cosmetic goals, preventive care is the foundation.
            Healthy gums and enamel help whitening, veneers, and Invisalign results look
            better and last longer.
          </p>
        </div>
      </section>

      <FAQSection items={preventiveFaqs} title="Preventive dentistry FAQs" />

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="Explore additional ways to maintain and restore your smile."
        className="bg-white"
      />

      <RelatedServicePosts
        serviceSlug="preventive-dentistry"
        serviceName="Preventive Dentistry"
      />
    </>
  );
};

export default PreventiveDentistry;
