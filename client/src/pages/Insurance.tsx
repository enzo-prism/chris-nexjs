"use client";

import MetaTags from "@/components/common/MetaTags";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { officeInfo } from "@/lib/data";
import { getSeoForPath } from "@/lib/seo";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  CreditCard,
  HeartHandshake,
  MapPin,
  Phone,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  type StructuredDataNode,
} from "@/lib/structuredData";
import { Link } from "wouter";

const Insurance = () => {
  const seo = getSeoForPath("/insurance");

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Insurance & Payment Options", path: "/insurance" },
  ];

  const faqs = [
    {
      question: "Do you accept my dental insurance?",
      answer:
        "We work with most major PPO dental insurance plans as an out-of-network provider. Many PPO plans include out-of-network benefits, so patients often still receive meaningful coverage here. Contact our office with your plan details and we'll help you verify your specific coverage before your appointment.",
    },
    {
      question: "What does out-of-network actually mean for my costs?",
      answer:
        "Out-of-network means our office doesn't have a contracted rate with your insurer. Your PPO plan typically still pays a percentage of treatment costs based on its fee schedule, and you cover the difference. Before any treatment, our team walks you through what your plan is expected to pay and what your portion would be—so there are no surprises.",
    },
    {
      question: "Can you verify my benefits before my first visit?",
      answer:
        "Yes. Share your insurance carrier, plan or member ID, and date of birth when you request an appointment, and our team will contact your insurer to verify benefits and explain your expected coverage before you come in.",
    },
    {
      question: "What if I don't have dental insurance?",
      answer:
        "We offer an in-house dental plan with savings on preventive care and treatments for patients without insurance, and we accept flexible payment options including credit cards, FSA/HSA funds, and CareCredit financing. Call our office for current plan details.",
    },
    {
      question: "Do you offer payment plans or financing?",
      answer:
        "We accept CareCredit financing, which lets you spread treatment costs over time, along with credit cards and flexible spending account (FSA) or health savings account (HSA) funds. Our team can help you choose the option that fits your situation.",
    },
    {
      question: "Will you give me a cost estimate before treatment?",
      answer:
        "Yes. After your exam, we explain what we see and provide clear recommendations with expected costs—including what your insurance is likely to cover—before you commit to any treatment.",
    },
  ];

  const structuredDataNodes: StructuredDataNode[] = [];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const faqSchema = buildFAQSchema(faqs, "/insurance");
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);
  if (faqSchema) structuredDataNodes.push(faqSchema);

  const paymentOptions = [
    {
      icon: ShieldCheck,
      title: "PPO insurance (out-of-network)",
      description:
        "Most major PPO dental plans include out-of-network benefits. We verify your coverage and explain expected costs before treatment.",
    },
    {
      icon: CreditCard,
      title: "Credit cards & cash",
      description:
        "We accept major credit cards and cash for treatment and preventive visits.",
    },
    {
      icon: Wallet,
      title: "FSA & HSA funds",
      description:
        "Flexible spending and health savings accounts can be used for eligible dental care.",
    },
    {
      icon: HeartHandshake,
      title: "CareCredit financing",
      description:
        "Spread treatment costs over time with CareCredit healthcare financing.",
    },
    {
      icon: BadgeCheck,
      title: "In-house dental plan",
      description:
        "No insurance? Our in-house plan offers savings on preventive care and treatments. Ask our team for current details.",
    },
  ];

  return (
    <>
      <MetaTags title={seo.title} description={seo.description} />
      {structuredDataNodes.length > 0 && (
        <StructuredData data={structuredDataNodes} />
      )}
      <PageBreadcrumbs items={breadcrumbItems} />

      <section className="bg-[#F5F9FC] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-semibold w-fit">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Insurance & Payments
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-[#1F2933]">
                Dental Insurance & Payment Options in Palo Alto
              </h1>
              <p className="text-lg text-slate-700 leading-relaxed max-w-3xl">
                We work with most major PPO dental insurance plans as an
                out-of-network provider, verify your benefits before your
                visit, and explain expected costs before any treatment begins.
                No insurance? We offer an in-house dental plan, CareCredit
                financing, and FSA/HSA-friendly payment options.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed max-w-3xl">
                Insurance shouldn&rsquo;t be the confusing part of dental care.
                Share your plan information when you request an appointment and
                our team will do the verification work for you—so you know
                where you stand before you sit down in the chair.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/schedule#appointment">
                  <Button className="ui-btn-primary">
                    Request an appointment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href={`tel:${officeInfo.phoneE164}`}>
                  <Button variant="outline" className="ui-btn-outline">
                    Call {officeInfo.phone}
                    <Phone className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
                <h2 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
                  Key facts
                </h2>
                <ul className="space-y-4 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <span>
                      Most major PPO dental plans accepted as an
                      out-of-network provider
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <BadgeCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <span>Benefits verified before your visit on request</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <span>
                      Credit cards, FSA/HSA, CareCredit, and an in-house plan
                      for uninsured patients
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <span>
                      {officeInfo.address.line1}, {officeInfo.address.line2}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <span>
                      Mon, Tue, Thu {officeInfo.hours.monday}; Wed{" "}
                      {officeInfo.hours.wednesday}; Fri {officeInfo.hours.friday}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <a
                      href={`tel:${officeInfo.phoneE164}`}
                      className="font-semibold text-slate-800 hover:text-primary transition-colors"
                    >
                      {officeInfo.phone}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              How PPO insurance works at our office
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Our office is an out-of-network provider for PPO dental plans.
              That phrase sounds more alarming than it is: most PPO plans
              include out-of-network benefits, which means your plan still pays
              a percentage of your care here—it simply calculates that
              percentage from its own fee schedule rather than a contracted
              rate. Your portion is the difference, and we tell you what that
              looks like before treatment, not after.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Choosing a dentist out-of-network often comes down to continuity
              and quality of care: you keep a doctor who knows your history and
              takes a{" "}
              <Link href="/preventive-dentistry" className="ui-link-premium">
                prevention-first, conservative approach
              </Link>
              , and your plan still contributes. If you&rsquo;re comparing
              options, send us your plan details—we&rsquo;ll give you real
              numbers to compare instead of guesswork.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              What we need to verify your benefits
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Send three things with your{" "}
              <Link href="/schedule" className="ui-link-premium">
                appointment request
              </Link>{" "}
              or call us with them: your insurance carrier, your plan or member
              ID, and the policyholder&rsquo;s name and date of birth. Our team
              contacts your insurer, confirms your coverage levels, and walks
              you through what to expect—deductible, annual maximum, and how
              preventive, basic, and major care are covered.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading text-[#1F2933]">
              Every way to pay
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {paymentOptions.map((option) => (
                <div
                  key={option.title}
                  className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6"
                >
                  <option.icon
                    className="h-6 w-6 text-primary mb-3"
                    aria-hidden="true"
                  />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-slate-700 leading-relaxed text-sm">
                    {option.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#1F2933] mb-4">
              Know your costs before you commit
            </h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              After your exam, Dr. Christopher B. Wong explains what he sees
              and recommends only the treatment your teeth actually need. You
              get clear next steps with expected costs—including what your
              insurance is likely to contribute—before anything is scheduled.
              For forms and visit preparation, see our{" "}
              <Link href="/patient-resources" className="ui-link-premium">
                patient resources
              </Link>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/schedule#appointment">
                <Button className="ui-btn-primary">
                  Request an appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="ui-btn-outline">
                  Ask about your plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#F5F9FC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading text-[#1F2933] mb-6">
            Insurance & payment FAQs
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
    </>
  );
};

export default Insurance;
