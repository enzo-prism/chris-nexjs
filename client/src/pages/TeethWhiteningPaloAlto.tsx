"use client";

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
import {
  buildBreadcrumbSchema,
  buildFAQSchema,  buildServiceSchema,  type StructuredDataNode,
} from "@/lib/structuredData";
import { ArrowRight, CheckCircle, Clock, MapPin, Phone, Sparkles } from "lucide-react";
import { Link } from "wouter";

const TeethWhiteningPaloAlto = () => {
  const seo = getSeoForPath("/teeth-whitening-palo-alto");

  const whiteningTestimonials = getTestimonialsByNames([
    "Kat Vasilakos",
    "Kevin Zhang",
    "Ashley Chung",
  ]);

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Teeth Whitening in Palo Alto", path: "/teeth-whitening-palo-alto" },
  ];

  const quickHighlights = [
    "Dentist‑supervised whitening (not DIY guessing)",
    "In‑office whitening and custom take‑home trays",
    "Sensitivity planning and comfort-focused care",
    "Natural‑looking shade goals and clear expectations",
  ];

  const goodFitFor = [
    "Coffee, tea, red wine, or aging-related surface stains",
    "A refresh before a big event or photos",
    "Patients who want safer, more predictable results than store kits",
  ];

  const considerAlternativesFor = [
    "Visible crowns, veneers, or bonding on front teeth (these don’t whiten)",
    "Very deep internal discoloration where veneers may be a better match",
    "Active decay or gum inflammation (we’ll treat this first)",
  ];

  const whiteningCanHelpWith = [
    "Yellowing from coffee/tea, wine, or aging",
    "A brighter shade across natural enamel",
    "Improving your smile before Invisalign or cosmetic finishing",
  ];

  const whiteningCannotChange = [
    "The color of crowns, veneers, or tooth‑colored fillings",
    "Severe internal stains in every situation (we’ll discuss alternatives)",
    "Uneven brightness if existing restorations are visible (planning helps)",
  ];

  const sensitivityPlan = [
    "Start with an exam so whitening is safe for enamel and gums",
    "Tailor gel strength and timing based on your sensitivity history",
    "Use desensitizing steps and fluoride when helpful",
    "Share a 24–48 hour post-care plan to reduce sensitivity triggers",
  ];

  const costFactors = [
    "Whether you choose in‑office whitening, take‑home trays, or both",
    "How much staining and shade change you’re aiming for",
    "Sensitivity considerations that affect strength and timing",
    "Whether you have restorations that may need to be color-matched afterward",
    "Insurance/FSA/HSA considerations (most whitening is cosmetic)",
  ];

  const lastUpdated = "December 2025";

  const faqs = [
    {
      question: "Is professional teeth whitening safe?",
      answer:
        "Yes. We evaluate your teeth and gums first, then use dentist‑supervised whitening gel and controlled light or take‑home trays to brighten safely without harming enamel.",
    },
    {
      question: "How long do whitening results last?",
      answer:
        "Most patients enjoy results for 12–24 months. The exact timeline depends on coffee/tea, red wine, tobacco, and how consistently you follow home care.",
    },
    {
      question: "Will whitening make my teeth sensitive?",
      answer:
        "Mild sensitivity is common for a day or two. We tailor the strength and timing to your comfort and can recommend desensitizing toothpaste or in‑office fluoride.",
    },
    {
      question: "What’s the difference between ZOOM whitening and store‑bought kits?",
      answer:
        "In‑office whitening uses higher‑quality gel and professional isolation, so you see a bigger change faster and with less risk of irritation. Store kits can help, but they’re less predictable.",
    },
    {
      question: "Can crowns or veneers be whitened?",
      answer:
        "No. Whitening only changes natural enamel. If you have visible restorations, we’ll plan whitening first and then match new restorations to your brighter shade if needed.",
    },
  ];

  const whiteningServiceSchema = buildServiceSchema({
    name: "Teeth Whitening",
    description:
      "Professional teeth whitening in Palo Alto with in‑office and custom take‑home options, tailored to your goals and sensitivity level.",
    slug: "/teeth-whitening-palo-alto",
    serviceType: "Teeth Whitening",
  });

  const structuredDataNodes: StructuredDataNode[] = [
    whiteningServiceSchema,
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const faqSchema = buildFAQSchema(faqs, "/teeth-whitening-palo-alto");
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);
  if (faqSchema) structuredDataNodes.push(faqSchema);

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/zoom-whitening",
      anchorText: "ZOOM whitening in Palo Alto",
      description: "Fast, in‑office whitening for noticeable results in one visit.",
    },
    {
      href: "/dental-veneers",
      anchorText: "Cosmetic veneers in Palo Alto",
      description: "Cover deep stains and reshape teeth for a new smile.",
    },
    {
      href: "/invisalign",
      anchorText: "Invisalign clear aligners",
      description: "Straighten teeth before finishing with whitening.",
    },
    {
      href: "/services#preventive-dentistry",
      anchorText: "Preventive dentistry",
      description: "Cleanings and exams to keep your smile bright long‑term.",
    },
  ];

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
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Palo Alto teeth whitening
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#1F2933]">
                Teeth Whitening in Palo Alto
              </h1>
              <p className="text-lg text-slate-700 leading-relaxed max-w-3xl">
                If your smile feels a little dull from coffee, tea, red wine, or natural aging, professional teeth
                whitening is one of the fastest ways to look refreshed. We offer dentist‑supervised whitening tailored
                to your goals and sensitivity level—so you get a brighter smile without guessing.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed max-w-3xl">
                We start with a quick evaluation to confirm whitening is a good fit. If there’s decay, worn enamel, or
                gum inflammation, we’ll address that first so whitening feels comfortable and lasts longer.
              </p>

              <ul className="grid gap-3 sm:grid-cols-2 text-sm text-slate-700 pt-2">
                {quickHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/schedule#appointment">
                  <Button className="bg-primary text-white hover:bg-primary/90">
                    Schedule whitening consultation
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
                      Mon–Thu: {officeInfo.hours.monday}
                      <br />
                      Fri: {officeInfo.hours.friday}
                      <br />
                      Sat–Sun: {officeInfo.hours.saturday}
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
              Whitening options we offer
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Our most popular option is professional in‑office whitening using{" "}
              <Link href="/zoom-whitening" className="text-primary font-semibold hover:underline">
                ZOOM! whitening in Palo Alto
              </Link>
              . In a single visit, we isolate the gums, apply professional whitening gel, and use controlled activation
              to brighten efficiently. If you’d prefer a more gradual approach, we also offer custom take‑home trays
              with professional gel and clear instructions.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Not sure which to choose? Many Palo Alto patients do a “boost + maintain” plan: an in‑office session for a
              quick jump in brightness, then take‑home trays a few times a year to maintain results. We’ll help you pick
              a plan that matches your timeline and comfort level.
            </p>

            <div className="grid gap-6 md:grid-cols-2 pt-1">
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  In‑office whitening (fast results)
                </h3>
                <p className="text-slate-700 leading-relaxed mb-5">
                  Ideal if you want a noticeable change quickly. We isolate soft tissue, confirm your shade goal, and
                  tailor strength and timing to reduce irritation and sensitivity.
                </p>
                <Link href="/zoom-whitening">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                    Learn about ZOOM! whitening
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  Custom take‑home trays (gradual)
                </h3>
                <p className="text-slate-700 leading-relaxed mb-5">
                  Great for a slower change, touch‑ups, or patients prone to sensitivity. Trays fit precisely, so gel
                  stays where it belongs and results feel more predictable.
                </p>
                <Link href="/schedule#appointment">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                    Ask about take‑home trays
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              Is whitening right for you?
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Whitening works best when teeth and gums are healthy. We’ll confirm candidacy first and then recommend the
              safest plan to reach a natural shade goal.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Often a good fit for</h3>
                <div className="space-y-3">
                  {goodFitFor.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">We’ll plan around</h3>
                <div className="space-y-3">
                  {considerAlternativesFor.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              What whitening can and can’t change
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Whitening brightens natural enamel. If you have visible restorations (like veneers, crowns, or bonding) we
              plan the sequence so your final shade looks even.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Whitening can help with</h3>
                <div className="space-y-3">
                  {whiteningCanHelpWith.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Whitening can’t change</h3>
                <div className="space-y-3">
                  {whiteningCannotChange.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  If you have front‑tooth restorations and want a brighter look, we can discuss whitening first and then
                  matching new restorations to the brighter shade.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              What to expect at your whitening visit
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Your appointment starts with shade photos so we can measure improvement. We protect lips and gums, then
              apply whitening gel in controlled sessions. If you’re prone to sensitivity, we can adjust concentration or
              timing and add desensitizing steps. After we reach your target shade, we review home care and foods to
              avoid for the first 24–48 hours.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              Sensitivity: what we do to minimize it
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Some sensitivity is common after whitening, but comfort matters. We tailor your plan and share practical
              post‑care so you can keep results without feeling “zingy.”
            </p>
            <div className="space-y-3">
              {sensitivityPlan.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              Keeping your results bright
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Whitening lasts longest when your teeth are healthy and clean. Regular visits for{" "}
              <Link href="/dental-cleaning-palo-alto" className="text-primary font-semibold hover:underline">
                dental cleanings in Palo Alto
              </Link>{" "}
              help remove surface stains and keep your shade stable. At home, brush twice daily, floss, and consider
              using a whitening toothpaste a few times per week. If you drink staining beverages, rinsing with water
              afterward can make a big difference.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Want a simple maintenance plan? Ask about take‑home trays so you can do occasional touch‑ups without
              starting from scratch.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              Cost factors and planning
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Whitening is personalized, so cost depends on your plan and goals. After your evaluation, we’ll explain
              options and provide a clear estimate before you start.
            </p>
            <div className="space-y-3">
              {costFactors.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link href="/schedule#appointment">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  Request an appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/patient-resources#insurance">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  Insurance & forms
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              Learn more
            </h2>
            <ul className="space-y-2 text-slate-700">
              <li>
                <Link href="/blog/how-long-does-teeth-whitening-last" className="text-primary font-semibold hover:underline">
                  How long does teeth whitening last?
                </Link>
              </li>
              <li>
                <Link href="/blog/teeth-whitening-sensitivity-what-helps" className="text-primary font-semibold hover:underline">
                  Teeth whitening sensitivity: what helps
                </Link>
              </li>
              <li>
                <Link href="/blog/in-office-whitening-vs-take-home-trays" className="text-primary font-semibold hover:underline">
                  In‑office whitening vs take‑home trays: what to expect
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#1F2933]">
              Trusted cosmetic care in Palo Alto
            </h2>
            <p className="mt-4 text-sm text-[#4B5563] sm:text-base max-w-3xl mx-auto">
              Patients appreciate the calm environment, clear explanations, and natural-looking results across whitening
              and other cosmetic services.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {whiteningTestimonials.map((testimonial) => (
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
            Teeth whitening FAQs
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
        subtitle="Combine whitening with other smile‑enhancing treatments."
        className="bg-white"
      />

      <section className="py-12 bg-primary text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-3xl font-bold font-heading">
            Ready for a brighter smile?
          </h2>
          <p className="text-white/90">
            We’ll help you choose the right whitening plan and reach a shade that looks
            natural on you. Schedule a visit or call our Palo Alto office today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/schedule#appointment">
              <Button className="bg-primary text-white hover:bg-primary/90 font-semibold">
                Book whitening visit
              </Button>
            </Link>
            <a href={`tel:${officeInfo.phoneE164}`}>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Call {officeInfo.phone}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default TeethWhiteningPaloAlto;
