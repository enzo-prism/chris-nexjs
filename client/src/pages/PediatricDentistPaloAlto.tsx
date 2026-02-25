"use client";

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

const PediatricDentistPaloAlto = () => {
  const seo = getSeoForPath("/pediatric-dentist-palo-alto");
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Pediatric Dentist in Palo Alto", path: "/pediatric-dentist-palo-alto" },
  ];

  const faqs = [
    {
      question: "When should my child first see a dentist?",
      answer:
        "We recommend a first visit by age 1 or within six months of the first tooth. Early visits build comfort and help prevent cavities.",
    },
    {
      question: "How often do kids need checkups?",
      answer:
        "Most children benefit from exams and cleanings every six months. If your child is cavity‑prone, we may recommend more frequent visits.",
    },
    {
      question: "What if my child is nervous?",
      answer:
        "That’s common. We take a gentle, talk‑through approach and move at your child’s pace to create positive experiences.",
    },
    {
      question: "Do you offer fluoride or sealants?",
      answer:
        "Yes. We can recommend fluoride, sealants, and diet coaching based on your child’s risk factors.",
    },
    {
      question: "Do you treat teens and orthodontic concerns?",
      answer:
        "Yes. We monitor growth, bite development, and can discuss Invisalign for teens when appropriate.",
    },
  ];

  const structuredDataNodes: StructuredDataNode[] = [];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const faqSchema = buildFAQSchema(faqs, "/pediatric-dentist-palo-alto");
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);
  if (faqSchema) structuredDataNodes.push(faqSchema);

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/dental-cleaning-palo-alto",
      anchorText: "Kids’ dental cleanings in Palo Alto",
      description: "Gentle cleanings and exams for healthy growth.",
    },
    {
      href: "/cavity-fillings-palo-alto",
      anchorText: "Tooth‑colored fillings",
      description: "Comfortable repairs for cavities in baby or adult teeth.",
    },
    {
      href: "/invisalign",
      anchorText: "Invisalign for teens",
      description: "Clear aligners for mild to moderate alignment needs.",
    },
    {
      href: "/services#pediatric-dentistry",
      anchorText: "Full pediatric dentistry services",
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
            Pediatric Dentist in Palo Alto
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed">
            Looking for a pediatric dentist in Palo Alto who treats your child like
            family? Dr. Christopher B. Wong and our team provide gentle, preventative
            care for infants, kids, and teens. We focus on building confidence early
            so dental visits feel normal—not scary.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed">
            Children’s teeth change quickly. Early checkups let us monitor growth,
            spot cavities sooner, and teach kids (and parents) practical habits that
            reduce decay. We keep visits upbeat and age‑appropriate, with plenty of
            time for questions.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed">
            Many families visit us from Menlo Park. If you’re searching for a{" "}
            <Link href="/dentist-menlo-park" className="text-primary font-semibold hover:underline">
              Menlo Park family dentist
            </Link>
            , our Palo Alto office is nearby and we’ll help you schedule kids’ and adult care with one consistent team.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/schedule#appointment">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Schedule a kids’ visit
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
            What happens at a pediatric dental visit
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Visits include a gentle cleaning, cavity check, and gum evaluation. We
            show kids how to brush and floss in ways that make sense for their age and
            coordination. If your child has crowded teeth or bite concerns, we track
            development and can discuss timing for orthodontic care.
          </p>
          <p className="text-slate-700 leading-relaxed">
            We also counsel on diet, snacking habits, and fluoride needs. For many
            kids, simple changes prevent most cavities.
          </p>

          <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
            A calm, family‑friendly environment
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Parents are welcome in the room whenever helpful. Our goal is to create
            steady routines that keep children comfortable. If your child has had a
            tough dental experience elsewhere, let us know—we’ll take extra time to
            rebuild trust.
          </p>

          <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
            Preventing cavities as kids grow
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Children are more prone to cavities because enamel is thinner and brushing
            habits are still developing. We focus on prevention first: careful cleanings,
            coaching on brushing and flossing, and age‑appropriate nutrition tips that
            fit real family life. If a child has deep grooves on the chewing surfaces,
            sealants can add extra protection where toothbrushes miss.
          </p>
          <p className="text-slate-700 leading-relaxed">
            We also monitor how baby teeth are spacing and when permanent teeth are
            likely to appear. Catching crowding or bite issues early gives families
            more options later, whether that’s simple monitoring or orthodontic planning.
          </p>

          <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
            Care for teens and young adults
          </h2>
          <p className="text-slate-700 leading-relaxed">
            As kids become teens, their dental needs change. We help manage sports
            mouthguard fit, wisdom‑tooth monitoring, and habits like grinding or heavy
            snacking that can affect enamel. For many families, clear aligners are an
            appealing way to straighten teeth without braces. We’ll explain timing and
            expectations so treatment works smoothly with school and activities.
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#F5F9FC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading text-[#1F2933] mb-6">
            Pediatric dentistry FAQs
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

      <RelatedServices items={relatedServices} className="bg-white" />
    </>
  );
};

export default PediatricDentistPaloAlto;
