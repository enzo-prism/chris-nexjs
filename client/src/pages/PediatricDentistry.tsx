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

const pediatricFaqs: FAQEntry[] = [
  {
    question: "When should my child first see a dentist?",
    answer:
      "We recommend a first visit by age one or within six months of the first tooth. Early visits help kids get comfortable and allow us to guide parents on brushing and nutrition.",
  },
  {
    question: "How often do children need checkups?",
    answer:
      "Most kids benefit from exams and cleanings every six months. If your child is cavity‑prone, we may recommend shorter intervals to keep teeth protected.",
  },
  {
    question: "Do you offer fluoride and sealants?",
    answer:
      "Yes. We recommend fluoride or sealants based on your child’s risk factors. Sealants protect deep grooves on chewing surfaces where toothbrushes can miss.",
  },
  {
    question: "What if my child is nervous?",
    answer:
      "That’s common. We use a calm, tell‑show‑do approach and move at your child’s pace. Our goal is to build positive experiences that last into adulthood.",
  },
  {
    question: "Do you treat teens and orthodontic concerns?",
    answer:
      "Yes. We monitor growth and bite development, and we can discuss Invisalign for teens when appropriate.",
  },
];

const PediatricDentistry = () => {
  const seo = getSeoForPath("/pediatric-dentistry");

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Pediatric Dentistry", path: "/pediatric-dentistry" },
  ];

  const pediatricServiceSchema = buildServiceSchema({
    name: "Pediatric Dentistry",
    description:
      "Gentle pediatric dentistry for infants, children, and teens, focused on prevention and long‑term oral health.",
    slug: "/pediatric-dentistry",
  });

  const pediatricBreadcrumbs = buildBreadcrumbSchema(breadcrumbItems);
  const pediatricFaqSchema = buildFAQSchema(pediatricFaqs, "/pediatric-dentistry");

  const schemas = [pediatricServiceSchema];
  if (pediatricBreadcrumbs) schemas.push(pediatricBreadcrumbs);
  if (pediatricFaqSchema) schemas.push(pediatricFaqSchema);

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/pediatric-dentist-palo-alto",
      anchorText: "Pediatric dentist in Palo Alto",
      description: "A dedicated page for families looking for kids’ care locally.",
    },
    {
      href: "/dental-cleaning-palo-alto",
      anchorText: "Dental cleanings in Palo Alto",
      description: "Preventive cleanings for all ages.",
    },
    {
      href: "/cavity-fillings-palo-alto",
      anchorText: "Tooth‑colored fillings",
      description: "Comfortable cavity repair for baby or adult teeth.",
    },
    {
      href: "/invisalign",
      anchorText: "Invisalign for teens",
      description: "Clear aligners for mild to moderate alignment needs.",
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
            Pediatric Dentistry in Palo Alto
          </h1>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-3xl mx-auto">
            Our pediatric dentistry program helps children build healthy habits and
            positive dental experiences from the start. Dr. Christopher B. Wong and our
            team provide gentle, age‑appropriate care for infants, kids, and teens.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/schedule#appointment">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Schedule a kids’ visit
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                Contact our office
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-bold font-heading text-slate-900">
            What to expect at a pediatric visit
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Visits include a gentle cleaning, a careful cavity and gum check, and
            guidance on brushing and flossing that matches your child’s age and
            coordination. We talk through what we’re doing in simple terms so kids feel
            involved and safe.
          </p>
          <p className="text-slate-700 leading-relaxed">
            We also monitor how baby teeth are spacing and how permanent teeth are
            coming in. Early insight into crowding or bite issues gives families more
            options later.
          </p>

          <h2 className="text-3xl font-bold font-heading text-slate-900">
            Prevention first
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Children are more prone to cavities because enamel is thinner and brushing
            habits are still developing. We focus on prevention with professional
            cleanings, fluoride recommendations, and sealants when appropriate. We also
            help families with nutrition tips that are realistic for busy schedules.
          </p>

          <h2 className="text-3xl font-bold font-heading text-slate-900">
            Supporting teens
          </h2>
          <p className="text-slate-700 leading-relaxed">
            As kids become teens, their needs change. We help with sports mouthguards,
            wisdom‑tooth monitoring, and orthodontic planning. Clear aligners can be a
            great option for teens who want a discreet way to straighten teeth.
          </p>
        </div>
      </section>

      <FAQSection items={pediatricFaqs} title="Pediatric dentistry FAQs" />

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="Explore other family‑focused care options."
        className="bg-white"
      />

      <RelatedServicePosts
        serviceSlug="pediatric-dentistry"
        serviceName="Pediatric Dentistry"
      />
    </>
  );
};

export default PediatricDentistry;
