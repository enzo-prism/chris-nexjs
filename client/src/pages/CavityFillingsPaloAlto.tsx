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

const CavityFillingsPaloAlto = () => {
  const seo = getSeoForPath("/cavity-fillings-palo-alto");
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Cavity Fillings in Palo Alto", path: "/cavity-fillings-palo-alto" },
  ];

  const faqs = [
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

  const structuredDataNodes: StructuredDataNode[] = [];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const faqSchema = buildFAQSchema(faqs, "/cavity-fillings-palo-alto");
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);
  if (faqSchema) structuredDataNodes.push(faqSchema);

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/crowns-palo-alto",
      anchorText: "Dental crowns in Palo Alto",
      description: "For larger cavities or cracked teeth needing full coverage.",
    },
    {
      href: "/services#restorative-dentistry",
      anchorText: "Restorative dentistry",
      description: "Fillings, crowns, and bridges to restore comfort and function.",
    },
    {
      href: "/dental-cleaning-palo-alto",
      anchorText: "Dental cleanings in Palo Alto",
      description: "Prevent cavities with regular professional care.",
    },
    {
      href: "/emergency-dental",
      anchorText: "Emergency dental care",
      description: "Same‑day help for toothaches or broken fillings.",
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
            Cavity Fillings in Palo Alto
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed">
            Cavities are common, but treating them early keeps your smile strong.
            Dr. Christopher B. Wong provides conservative, tooth‑colored fillings in
            Palo Alto that restore a tooth’s strength while blending naturally with
            your enamel.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed">
            A cavity starts when bacteria wear through the outer enamel. At first it
            may not hurt, which is why routine exams and X‑rays matter. If we catch
            decay early, we remove only the damaged portion and rebuild the tooth
            with composite resin that bonds to the structure underneath.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/schedule#appointment">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Schedule a filling visit
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
            Our approach to tooth‑colored fillings
          </h2>
          <p className="text-slate-700 leading-relaxed">
            We use modern composite materials that match the shade of your tooth and
            support natural chewing forces. Because composite bonds to enamel, we can
            preserve more healthy structure compared to older metal fillings. We also
            shape and polish each filling so your bite feels comfortable and smooth.
          </p>
          <p className="text-slate-700 leading-relaxed">
            If you’re sensitive or anxious, let us know. We take time to numb gently,
            explain what we see, and work at a pace that keeps you relaxed.
          </p>

          <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
            What a filling visit is like
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Your visit starts with a careful exam and digital imaging when needed so
            we can see the size and location of the decay. We numb the tooth and
            isolate it to keep the area dry. After removing the softened enamel, we
            rebuild the tooth in small layers, curing each one to create a strong
            bond.
          </p>
          <p className="text-slate-700 leading-relaxed">
            Before you leave, we refine your bite and polish the filling so it feels
            smooth when you chew. Most appointments are quick and conservative, and
            you can return to work or school right after.
          </p>

          <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
            Signs you may need a filling
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Sensitivity to cold or sweets, a rough edge, or food catching between
            teeth can all signal decay. Sometimes there are no symptoms at all, which
            is why cleanings and exams matter. If decay spreads too far, a filling may
            not be enough and a crown becomes the safer option.
          </p>

          <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
            Aftercare and prevention
          </h2>
          <p className="text-slate-700 leading-relaxed">
            You can eat normally once numbness wears off. We recommend avoiding very
            sticky foods on the first day. To prevent future cavities, brush twice
            daily, floss, and keep a steady schedule of professional cleanings.
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#F5F9FC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading text-[#1F2933] mb-6">
            Cavity filling FAQs
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

export default CavityFillingsPaloAlto;
