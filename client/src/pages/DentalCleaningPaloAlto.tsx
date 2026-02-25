import MetaTags from "@/components/common/MetaTags";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import RelatedServices, { type RelatedServiceLink } from "@/components/common/RelatedServices";
import StructuredData from "@/components/seo/StructuredData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { officeInfo } from "@/lib/data";
import { getSeoForPath } from "@/lib/seo";
import { buildBreadcrumbSchema, buildFAQSchema, type StructuredDataNode } from "@/lib/structuredData";
import { Link } from "wouter";

const DentalCleaningPaloAlto = () => {
  const seo = getSeoForPath("/dental-cleaning-palo-alto");
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Dental Cleaning in Palo Alto", path: "/dental-cleaning-palo-alto" },
  ];

  const faqs = [
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

  const structuredDataNodes: StructuredDataNode[] = [];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const faqSchema = buildFAQSchema(faqs, "/dental-cleaning-palo-alto");
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);
  if (faqSchema) structuredDataNodes.push(faqSchema);

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/services#preventive-dentistry",
      anchorText: "Preventive dentistry in Palo Alto",
      description: "Exams, cleanings, sealants, and fluoride to prevent problems early.",
    },
    {
      href: "/cavity-fillings-palo-alto",
      anchorText: "Cavity fillings in Palo Alto",
      description: "Tooth‑colored composite fillings for small or moderate decay.",
    },
    {
      href: "/emergency-dental",
      anchorText: "Emergency dental care",
      description: "Same‑day visits for sudden pain or tooth damage.",
    },
    {
      href: "/teeth-whitening-palo-alto",
      anchorText: "Teeth whitening in Palo Alto",
      description: "Brighten your smile after a fresh cleaning.",
    },
  ];

  return (
    <>
      <MetaTags title={seo.title} description={seo.description} />
      {structuredDataNodes.length > 0 && <StructuredData data={structuredDataNodes} />}
      <PageBreadcrumbs items={breadcrumbItems} />

      <section className="bg-[#F5F9FC] py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#1F2933]">
            Dental Cleaning in Palo Alto
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed">
            Regular dental cleanings are the foundation of long‑term oral health. At
            Dr. Christopher B. Wong’s Palo Alto practice, our hygienists and doctors
            focus on comfortable, thorough cleanings that remove plaque, tartar, and
            surface stains—while also catching small issues before they turn into
            expensive problems.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed">
            Even if you brush and floss consistently, bacteria can collect in hard‑to‑reach
            areas and under the gumline. That buildup is what leads to cavities, gum
            inflammation, and bad breath. A professional cleaning resets your mouth to
            a healthy baseline and keeps your smile looking polished.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/schedule#appointment">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Book a cleaning
              </Button>
            </Link>
            <a href={`tel:${officeInfo.phoneE164}`}>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                Call {officeInfo.phone}
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
            What’s included in your visit
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Your appointment typically includes plaque and tartar removal, gentle
            polishing, flossing, and a personalized home‑care review. We also check
            gum health by measuring pockets around the teeth. If we see early signs of
            gum disease, we’ll explain options to reverse it before it becomes a
            chronic issue.
          </p>
          <p className="text-slate-700 leading-relaxed">
            Cleanings are also paired with a dental exam so you leave knowing exactly
            what’s going on. If a cavity is starting, we can plan a small, conservative
            filling. If a tooth is cracked, we’ll discuss repair before it becomes
            painful.
          </p>

          <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
            A preventive approach for busy Palo Alto families
          </h2>
          <p className="text-slate-700 leading-relaxed">
            We’re a family‑friendly practice, so we see many patients in the same
            household. Our goal is to keep your schedule simple and your care
            predictable. We’ll recommend cleaning intervals based on your risk
            factors—no one‑size‑fits‑all approach.
          </p>
          <p className="text-slate-700 leading-relaxed">
            If you’re interested in whitening or Invisalign, cleanings are the best
            place to start. A clean, healthy foundation helps cosmetic results look
            better and last longer.
          </p>

          <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
            When a deep cleaning is the right next step
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Sometimes we see inflammation or deeper plaque buildup that a routine
            cleaning can’t fully remove. In those cases, we may recommend a deep
            cleaning—also called scaling and root planing. This treatment gently
            clears bacteria from below the gumline and smooths the root surfaces so
            your gums can heal and reattach.
          </p>
          <p className="text-slate-700 leading-relaxed">
            If a deep cleaning is needed, we’ll explain what we’re seeing, how many
            visits it may take, and how we’ll keep you comfortable. Our goal is to
            stabilize gum health early so you can return to simple maintenance visits
            and avoid long‑term periodontal issues.
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#F5F9FC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading text-[#1F2933] mb-6">
            Dental cleaning FAQs
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.question}
                value={faq.question}
                className="bg-white rounded-2xl border border-slate-100 px-5"
              >
                <AccordionTrigger className="text-left text-slate-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="Explore other preventive and restorative care options."
        className="bg-white"
      />
    </>
  );
};

export default DentalCleaningPaloAlto;
