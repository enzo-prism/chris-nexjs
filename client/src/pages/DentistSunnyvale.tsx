import MetaTags from "@/components/common/MetaTags";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import RelatedServices, { type RelatedServiceLink } from "@/components/common/RelatedServices";
import StructuredData from "@/components/seo/StructuredData";
import TestimonialQuote from "@/components/testimonials/TestimonialQuote";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { officeInfo } from "@/lib/data";
import { getSeoForPath } from "@/lib/seo";
import { getTestimonialsByNames } from "@/lib/testimonials";
import { ArrowRight, CheckCircle, Clock, MapPin, Phone } from "lucide-react";
import {  buildBreadcrumbSchema,
  buildFAQSchema,  buildReviewSchemas,  type StructuredDataNode,
} from "@/lib/structuredData";
import { Link } from "wouter";

const DentistSunnyvale = () => {
  const seo = getSeoForPath("/dentist-sunnyvale");

  const familyTestimonials = getTestimonialsByNames([
    "Kat Vasilakos",
    "Benjamin Wendorf",
    "Sarah Chase",
  ]);

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Sunnyvale Family Dentist", path: "/dentist-sunnyvale" },
  ];

  const faqs = [
    {
      question: "Do you accept patients from Sunnyvale?",
      answer:
        "Yes. Sunnyvale patients visit our Palo Alto office for preventive care, restorative treatment, Invisalign, and cosmetic dentistry.",
    },
    {
      question: "How far is your office from Sunnyvale?",
      answer:
        "We are a short drive from Sunnyvale. When you schedule, we share the easiest routes and arrival tips.",
    },
    {
      question: "Do you see kids, teens, and adults?",
      answer:
        "Yes. We are a family practice and provide care for every age with a focus on prevention and comfort.",
    },
    {
      question: "Do you offer Invisalign for Sunnyvale patients?",
      answer:
        "Yes. Invisalign is a popular option for Sunnyvale patients who want a discreet orthodontic plan.",
    },
    {
      question: "Can you help with dental emergencies?",
      answer:
        "Yes. If you have sudden pain, swelling, or a broken tooth, call us and we will help you find a same-day visit when available.",
    },
    {
      question: "Do you accept PPO dental insurance?",
      answer:
        "We work with many PPO plans and will help verify benefits before treatment.",
    },
  ];

  const structuredDataNodes: StructuredDataNode[] = [];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const faqSchema = buildFAQSchema(faqs, "/dentist-sunnyvale");
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);
  if (faqSchema) structuredDataNodes.push(faqSchema);
  structuredDataNodes.push(...buildReviewSchemas(familyTestimonials));

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/pediatric-dentist-palo-alto",
      anchorText: "Pediatric dentist near Sunnyvale",
      description: "Gentle care for kids and teens in a calm environment.",
    },
    {
      href: "/dental-cleaning-palo-alto",
      anchorText: "Dental cleanings near Sunnyvale",
      description: "Preventive visits that keep small issues from growing.",
    },
    {
      href: "/cavity-fillings-palo-alto",
      anchorText: "Tooth-colored fillings in Palo Alto",
      description: "Conservative repairs for cavities and cracks.",
    },
    {
      href: "/invisalign",
      anchorText: "Invisalign near Sunnyvale",
      description: "Clear aligners for teens and adults.",
    },
    {
      href: "/emergency-dental",
      anchorText: "Emergency dentist near Sunnyvale",
      description: "Same-day help for toothaches and dental trauma.",
    },
  ];

  const lastUpdated = "February 2026";

  return (
    <>
      <MetaTags title={seo.title} description={seo.description} />
      {structuredDataNodes.length > 0 && <StructuredData data={structuredDataNodes} />}
      <PageBreadcrumbs items={breadcrumbItems} />

      <section className="bg-[#F5F9FC] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-semibold w-fit">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Near Sunnyvale
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#1F2933]">
                Sunnyvale Family Dentist - Care Nearby in Palo Alto
              </h1>
              <p className="text-lg text-slate-700 leading-relaxed max-w-3xl">
                Sunnyvale patients visit Dr. Christopher B. Wong for modern, conservative dental care in nearby Palo Alto.
                We serve kids, teens, adults, and seniors with a focus on comfort, clear explanations, and long-term oral health.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed max-w-3xl">
                Common visits include preventive cleanings, cavity fillings, Invisalign, and emergency dental care. We help you
                understand your options so you can choose the best next step for your smile.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/schedule#appointment">
                  <Button className="bg-primary text-white hover:bg-primary/90">
                    Request an appointment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href={`tel:${officeInfo.phoneE164}`}>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                    Call {officeInfo.phone}
                    <Phone className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2 text-sm text-slate-700 pt-2">
                {[
                  "Family dentistry for kids through seniors",
                  "Prevention-first, conservative approach",
                  "Digital imaging and modern planning",
                  "Help verifying PPO insurance benefits",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
                      Office location
                    </p>
                    <p className="mt-2 text-slate-800 leading-relaxed">
                      {officeInfo.address.line1}
                      <br />
                      {officeInfo.address.line2}
                    </p>
                    <a
                      href={officeInfo.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-primary font-semibold hover:underline"
                    >
                      Get directions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
                      Phone
                    </p>
                    <a
                      href={`tel:${officeInfo.phoneE164}`}
                      className="mt-2 inline-flex items-center text-slate-800 font-semibold hover:text-primary transition-colors"
                    >
                      {officeInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
                      Hours
                    </p>
                    <p className="mt-2 text-slate-700 leading-relaxed text-sm">
                      Mon-Thu: {officeInfo.hours.monday}
                      <br />
                      Fri: {officeInfo.hours.friday}
                      <br />
                      Sat-Sun: {officeInfo.hours.saturday}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              Family dentistry for Sunnyvale patients
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Sunnyvale families often want a practice that feels calm, consistent, and easy to work with. We focus on
              prevention, clear communication, and conservative care so you can keep dental health on track without
              surprises.
            </p>
            <p className="text-slate-700 leading-relaxed">
              If your child needs a gentle start, our{" "}
              <Link
                href="/pediatric-dentist-palo-alto"
                className="text-primary font-semibold hover:underline"
              >
                pediatric dentist team
              </Link>{" "}
              emphasizes comfort and confidence. For adults, we prioritize early detection and treatment that protects
              healthy tooth structure.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              Care for every age
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Kids</h3>
                <p className="text-slate-700 leading-relaxed">
                  Gentle visits focused on prevention, cavity risk reduction, and healthy routines.
                  Explore{" "}
                  <Link href="/pediatric-dentist-palo-alto" className="text-primary font-semibold hover:underline">
                    pediatric dentistry
                  </Link>{" "}
                  for Sunnyvale families.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Teens</h3>
                <p className="text-slate-700 leading-relaxed">
                  Checkups, sports mouthguard planning, and guidance on habits that affect enamel.
                  For alignment goals, many teens choose{" "}
                  <Link href="/invisalign" className="text-primary font-semibold hover:underline">
                    Invisalign
                  </Link>{" "}
                  because it is discreet and removable.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Adults</h3>
                <p className="text-slate-700 leading-relaxed">
                  Prevention, fillings, crowns, and cosmetic improvements with clear recommendations.
                  Start with{" "}
                  <Link href="/preventive-dentistry" className="text-primary font-semibold hover:underline">
                    preventive dentistry
                  </Link>{" "}
                  and regular{" "}
                  <Link href="/dental-cleaning-palo-alto" className="text-primary font-semibold hover:underline">
                    cleanings
                  </Link>
                  .
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Seniors</h3>
                <p className="text-slate-700 leading-relaxed">
                  Support for older restorations, bite wear, and long-term maintenance. If a tooth breaks or starts
                  hurting, our{" "}
                  <Link href="/emergency-dental" className="text-primary font-semibold hover:underline">
                    emergency dental care
                  </Link>{" "}
                  team can often help the same day.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              Common visits for Sunnyvale families
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We are known for thorough preventive visits and clear next steps when something needs attention. Common
              needs include routine{" "}
              <Link href="/dental-cleaning-palo-alto" className="text-primary font-semibold hover:underline">
                cleanings and exams
              </Link>
              ,{" "}
              <Link href="/cavity-fillings-palo-alto" className="text-primary font-semibold hover:underline">
                tooth-colored fillings
              </Link>
              , and{" "}
              <Link href="/crowns-palo-alto" className="text-primary font-semibold hover:underline">
                dental crowns
              </Link>{" "}
              when a tooth needs added protection.
            </p>
            <p className="text-slate-700 leading-relaxed">
              If you are considering orthodontics,{" "}
              <Link href="/invisalign" className="text-primary font-semibold hover:underline">
                Invisalign
              </Link>{" "}
              is a popular option for Sunnyvale patients because it fits work and school schedules. For cosmetic goals,
              we also offer whitening and veneers when appropriate.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#1F2933] mb-4">
              Planning your visit from Sunnyvale
            </h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              Our Palo Alto office is located at {officeInfo.address.line1}, {officeInfo.address.line2}. We will share
              parking and arrival tips when you schedule. If you would like to coordinate appointments for multiple family
              members, call our team and we will help build a plan that fits your calendar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/schedule#appointment">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  Request an appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/patient-resources#insurance">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  Insurance and forms
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#1F2933]">
              Trusted by families across the Peninsula
            </h2>
            <p className="mt-4 text-sm text-[#4B5563] sm:text-base max-w-3xl mx-auto">
              Patients appreciate the calm environment, conservative care, and clear explanations at every visit.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {familyTestimonials.map((testimonial) => (
              <TestimonialQuote key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>

          <p className="mt-8 text-xs text-slate-500 text-center">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#F5F9FC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading text-[#1F2933] mb-6">
            Sunnyvale dentist FAQs
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
        subtitle="Explore care options for kids, teens, and adults."
        className="bg-white"
      />
    </>
  );
};

export default DentistSunnyvale;
