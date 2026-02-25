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

const CrownsPaloAlto = () => {
  const seo = getSeoForPath("/crowns-palo-alto");
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Dental Crowns in Palo Alto", path: "/crowns-palo-alto" },
  ];

  const faqs = [
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
      answer:
        "Yes. We select materials and shades that match your enamel so your crown blends into your smile.",
    },
    {
      question: "How long do crowns last?",
      answer:
        "With good hygiene and regular checkups, crowns often last 10–15 years or longer.",
    },
    {
      question: "Will getting a crown hurt?",
      answer:
        "We numb the area thoroughly. You may feel mild soreness afterward, but most patients return to normal activities the same day.",
    },
  ];

  const structuredDataNodes: StructuredDataNode[] = [];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const faqSchema = buildFAQSchema(faqs, "/crowns-palo-alto");
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);
  if (faqSchema) structuredDataNodes.push(faqSchema);

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/cavity-fillings-palo-alto",
      anchorText: "Cavity fillings in Palo Alto",
      description: "For smaller areas of decay that don’t need full coverage.",
    },
    {
      href: "/dental-implants",
      anchorText: "Dental implants",
      description: "Replace a tooth that can’t be restored.",
    },
    {
      href: "/emergency-dental",
      anchorText: "Emergency dental care",
      description: "Same‑day help for broken or painful teeth.",
    },
    {
      href: "/services#restorative-dentistry",
      anchorText: "Restorative dentistry",
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
            Dental Crowns in Palo Alto
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed">
            A dental crown protects and strengthens a tooth that’s been weakened by
            decay, cracks, or previous dental work. At our Palo Alto office, Dr. Wong
            designs crowns to feel comfortable, look natural, and restore confident
            chewing.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed">
            We recommend crowns when a filling wouldn’t be strong enough to protect
            the remaining tooth. Crowns act like a durable “cap” over the tooth,
            sealing out bacteria and distributing bite forces evenly.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/schedule#appointment">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Schedule a crown consult
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
            What to expect
          </h2>
          <p className="text-slate-700 leading-relaxed">
            At the first visit, we examine the tooth, remove any decay or fractures,
            and shape it to fit a crown. We take precise impressions so your final
            crown fits your bite and matches adjacent teeth. A comfortable temporary
            crown protects the tooth while your custom crown is crafted.
          </p>
          <p className="text-slate-700 leading-relaxed">
            At the second visit, we confirm fit, polish the contact points, and bond
            the crown securely. You’ll leave with a tooth that looks and feels natural.
          </p>

          <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
            Materials chosen for strength and a natural look
          </h2>
          <p className="text-slate-700 leading-relaxed">
            We design crowns with both durability and appearance in mind. For back
            teeth that handle heavy chewing, we often recommend high‑strength ceramic
            or zirconia. For front teeth, we prioritize lifelike translucency so your
            crown blends seamlessly with neighboring enamel. We’ll talk through
            material options based on the tooth, your bite, and your cosmetic goals.
          </p>
          <p className="text-slate-700 leading-relaxed">
            Because the crown is custom‑made, small details matter—shade, shape,
            contour, and how it meets the gumline. Our Palo Alto team takes the time
            to fine‑tune those details so the final result feels like your own tooth,
            not a replacement.
          </p>

          <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
            Caring for your crown
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Crowns are strong, but they rely on healthy gums and good home care. Brush
            and floss normally, paying attention to the gumline. If you grind your
            teeth at night, a protective guard can extend the life of your crown.
          </p>

          <p className="text-slate-700 leading-relaxed">
            If you ever feel a new rough edge, notice lingering sensitivity, or think
            your bite has changed, let us know right away. Early adjustments are
            simple and help your crown last for many years.
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#F5F9FC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading text-[#1F2933] mb-6">
            Crown FAQs
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

export default CrownsPaloAlto;
