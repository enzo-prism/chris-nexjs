import MetaTags from "@/components/common/MetaTags";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import RelatedServices, { type RelatedServiceLink } from "@/components/common/RelatedServices";
import StructuredData from "@/components/seo/StructuredData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { officeInfo } from "@/lib/data";
import { getSeoForPath } from "@/lib/seo";
import {  buildBreadcrumbSchema,
  buildFAQSchema,  buildReviewSchemas,
  type StructuredDataNode,
} from "@/lib/structuredData";
import { Link } from "wouter";
import { getTestimonialsByNames } from "@/lib/testimonials";

const DentistStanford = () => {
  const seo = getSeoForPath("/dentist-stanford");
  const familyTestimonials = getTestimonialsByNames([
    "Madison Ho",
    "Kevin Zhang",
    "Sandra Bell",
  ]);
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Stanford Dentist", path: "/dentist-stanford" },
  ];

  const faqs = [
    {
      question: "Do you see Stanford students and faculty?",
      answer:
        "Yes. We’re a nearby Palo Alto dental practice serving Stanford students, staff, faculty, and families.",
    },
    {
      question: "Can you help with dental emergencies?",
      answer:
        "Absolutely. If you have sudden pain, swelling, or a broken tooth, we can often see you the same day.",
    },
    {
      question: "Do you offer Invisalign for students?",
      answer:
        "Yes. Invisalign is a popular option for Stanford students and professionals who want discreet orthodontic care.",
    },
    {
      question: "Is your office close to campus?",
      answer:
        "We’re a short drive or bike ride from Stanford, making it convenient to fit dental visits into your schedule.",
    },
  ];

  const structuredDataNodes: StructuredDataNode[] = [];
  structuredDataNodes.push(...buildReviewSchemas(familyTestimonials));
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const faqSchema = buildFAQSchema(faqs, "/dentist-stanford");
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);
  if (faqSchema) structuredDataNodes.push(faqSchema);

  const relatedServices: RelatedServiceLink[] = [
    { href: "/dental-cleaning-palo-alto", anchorText: "Dental cleanings near Stanford" },
    { href: "/invisalign", anchorText: "Invisalign near Stanford" },
    { href: "/emergency-dental", anchorText: "Emergency dental care near Stanford" },
    { href: "/cavity-fillings-palo-alto", anchorText: "Cavity fillings in Palo Alto" },
    { href: "/services", anchorText: "All services" },
  ];

  return (
    <>
      <MetaTags title={seo.title} description={seo.description} />
      {structuredDataNodes.length > 0 && <StructuredData data={structuredDataNodes} />}
      <PageBreadcrumbs items={breadcrumbItems} />

      <section className="bg-[#F5F9FC] py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#1F2933]">
            Stanford Dentist — Convenient Palo Alto Care
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed">
            Stanford students, faculty, and families often need a dentist they can
            trust close to campus. Our practice in Palo Alto offers modern, conservative
            care designed for busy schedules—whether you’re on a quarter system, working
            long hospital shifts, or balancing family life.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed">
            We provide preventive checkups, restorative treatment, Invisalign, cosmetic
            services, and emergency visits. Our approach is calm and practical: we
            focus on protecting healthy tooth structure, explaining options clearly,
            and helping you stay comfortable at every step.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/schedule#appointment">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Schedule a visit
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
            Popular services for Stanford patients
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Routine cleanings and exams are the easiest way to avoid surprise problems
            during the school year. If you’re interested in orthodontics, our{" "}
            <Link href="/invisalign" className="text-primary font-semibold hover:underline">
              Invisalign program
            </Link>{" "}
            offers clear aligners that fit seamlessly into student and professional life.
          </p>
          <p className="text-slate-700 leading-relaxed">
            We also see many Stanford patients for cavity fillings, crowns, and urgent
            toothaches. If something breaks or starts hurting, don’t wait—our emergency
            team can often help the same day.
          </p>

          <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
            Getting to our office
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Our Palo Alto office is at {officeInfo.address.line1}, {officeInfo.address.line2}.
            We’ll share parking and arrival tips when you schedule. If you’re coming
            from campus, most visits fit easily between classes or meetings.
          </p>

          <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
            Dental care that fits the Stanford calendar
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Life at Stanford moves fast, and dental care shouldn’t add stress. We help
            students and faculty stay ahead of problems with efficient preventive visits
            and clear follow‑up. If you’re leaving town for a break or starting a busy
            quarter, we can prioritize the most important needs so you don’t have to
            worry about tooth pain during finals or travel.
          </p>
          <p className="text-slate-700 leading-relaxed">
            For international students and new residents, we’re happy to walk through
            how routine care works in the U.S., what to expect with insurance, and how
            to plan a sensible schedule. We want you to feel confident about your care
            and comfortable asking questions.
          </p>

          <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
            Same‑day help for urgent issues
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Toothaches and chipped teeth never happen at a convenient time. If you have
            sudden pain, swelling, or a broken filling, call us as soon as you can.
            Stanford patients often choose our practice because we’re close enough to
            campus to make same‑day care realistic. We’ll diagnose the problem quickly
            and explain your options so you can get back to your day.
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#F5F9FC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading text-[#1F2933] mb-6">
            Stanford dentist FAQs
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

export default DentistStanford;
