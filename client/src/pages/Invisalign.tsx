import { CheckCircle, ArrowRight, Shield, Clock, Star, Users, Smile, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import MetaTags from "@/components/common/MetaTags";
import StructuredData from "@/components/seo/StructuredData";
import { motion } from "framer-motion";
import OptimizedImage from "@/components/seo/OptimizedImage";
import TestimonialQuote from "@/components/testimonials/TestimonialQuote";
import { getTestimonialsByNames } from "@/lib/testimonials";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import FAQSection from "@/components/common/FAQSection";
import RelatedServices, {
  type RelatedServiceLink,
} from "@/components/common/RelatedServices";
import {  buildBreadcrumbSchema,
  buildHowToSchema,
  buildFAQSchema,
  buildServiceSchema,
  type FAQEntry,
} from "@/lib/structuredData";
import RelatedServicePosts from "@/components/blog/RelatedServicePosts";
import { pageDescriptions, pageTitles } from "@/lib/metaContent";
import { doctorInfo, officeInfo } from "@/lib/data";

const invisalignFaqs: FAQEntry[] = [
  {
    question: "How long does Invisalign treatment take?",
    answer:
      "Most Invisalign cases take about 12–18 months, but timing depends on the complexity of your bite and how consistently you wear your aligners. Some minor corrections can finish sooner, while more involved plans may take longer. We’ll review your estimated timeline after your digital scan.",
  },
  {
    question: "How many hours per day do I need to wear aligners?",
    answer:
      "For the best results, aligners should be worn 20–22 hours per day. You’ll take them out to eat, drink anything besides water, and brush and floss, then place them right back in.",
  },
  {
    question: "Does Invisalign hurt?",
    answer:
      "You may feel pressure or mild soreness for a day or two when you switch to a new set of aligners. That’s a sign your teeth are moving. Most patients find the discomfort manageable and far less irritating than braces.",
  },
  {
    question: "Can I eat and drink normally with Invisalign?",
    answer:
      "Yes—one of the biggest benefits is that you remove aligners to eat. That means no food restrictions. We recommend brushing before reinserting aligners to keep trays clear and reduce the risk of cavities.",
  },
  {
    question: "How much does Invisalign cost?",
    answer:
      "Cost varies based on the amount of tooth movement needed. During your consultation we’ll outline a clear fee estimate, expected phases, and payment options. Many PPO plans include orthodontic benefits that can apply to Invisalign.",
  },
  {
    question: "Will I need attachments or rubber bands?",
    answer:
      "Some Invisalign plans use small, tooth‑colored attachments to help aligners grip and guide specific tooth movements. Rubber bands (elastics) are sometimes used to correct bite relationships. Not every case needs these—your exam and digital scan will determine what’s appropriate.",
  },
  {
    question: "How often are Invisalign checkups?",
    answer:
      "You’ll return for periodic checkups so we can confirm your teeth are tracking and make any needed adjustments. Visit frequency varies by plan and how your teeth respond, and we’ll outline your schedule at the start.",
  },
  {
    question: "Where is your Palo Alto Invisalign office located?",
    answer:
      `We’re located at ${officeInfo.address.line1}, ${officeInfo.address.line2}. We welcome Invisalign patients from Palo Alto, Menlo Park, Stanford, and Mountain View.`,
  },
  {
    question: "What happens after Invisalign is finished?",
    answer:
      "Once your teeth are aligned, you’ll wear retainers to maintain the result. Retainers are typically worn full‑time for a short period and then at night long‑term. We’ll guide you on a schedule that keeps your smile stable.",
  },
];

const Invisalign = () => {
  const invisalignTestimonials = getTestimonialsByNames([
    "Kevin Zhang",
    "Ashley Chung",
    "Abdel Fahmy",
  ]);

  const invisalignBenefits = [
    {
      title: "Virtually Invisible",
      description: "Clear aligners are nearly invisible, so you can smile confidently during treatment",
      icon: <Smile className="h-8 w-8 text-primary" />
    },
    {
      title: "Removable Convenience",
      description: "Remove aligners for eating, drinking, brushing, and special occasions",
      icon: <Shield className="h-8 w-8 text-primary" />
    },
    {
      title: "Comfortable Fit",
      description: "Smooth plastic aligners are more comfortable than traditional metal braces",
      icon: <Star className="h-8 w-8 text-primary" />
    },
    {
      title: "Predictable Results",
      description: "Advanced 3D technology allows you to see your treatment plan and expected results",
      icon: <Clock className="h-8 w-8 text-primary" />
    }
  ];

  const treatmentProcess = [
    {
      step: "1",
      title: "Initial Consultation",
      description: "Dr. Wong evaluates your teeth and discusses your goals to determine if Invisalign is right for you.",
      duration: "60 minutes"
    },
    {
      step: "2", 
      title: "3D Digital Scan",
      description: "We create precise 3D images of your teeth using advanced digital scanning technology.",
      duration: "30 minutes"
    },
    {
      step: "3",
      title: "Custom Treatment Plan",
      description: "Your personalized treatment plan is created, showing the step-by-step movement of your teeth.",
      duration: "1-2 weeks"
    },
    {
      step: "4",
      title: "Aligner Fabrication",
      description: "Your custom aligners are manufactured using state-of-the-art technology.",
      duration: "2-3 weeks"
    },
    {
      step: "5",
      title: "Treatment Begins",
      description: "You receive your first set of aligners and begin your smile transformation journey.",
      duration: "12-18 months average"
    }
  ];

  const conditions = [
    "Crowded teeth",
    "Gaps between teeth",
    "Overbite or underbite",
    "Crossbite",
    "Open bite",
    "Crooked or misaligned teeth",
    "Teeth shifting after past braces",
  ];

  const candidacyGoodFit = [
    "Mild to moderate crowding or spacing",
    "Relapse after previous orthodontics",
    "Adults and teens who want removable aligners",
    "Patients who can wear aligners 20–22 hours per day",
  ];

  const candidacyConsiderations = [
    "Active gum disease or untreated cavities (we’ll address these first)",
    "More complex bite issues that may be better treated with braces or specialist care",
    "If you can’t wear aligners consistently (compliance matters)",
  ];

  const careInstructions = [
    "Wear aligners 20-22 hours per day for optimal results",
    "Remove aligners when eating or drinking (except water)",
    "Clean aligners daily with lukewarm water and mild soap",
    "Brush and floss teeth before reinserting aligners",
    "Store aligners in their case when not wearing them",
    "Follow your scheduled aligner changes as directed"
  ];

  const costFactors = [
    "How much tooth movement and bite correction you need",
    "Whether attachments, elastics, or refinements are recommended",
    "Any dental work needed before you start (cleanings, fillings, gum care)",
    "Retainers and follow‑up to protect your result",
    "Orthodontic benefits through PPO insurance, plus HSA/FSA options",
  ];

  const consultationChecklist = [
    "Share your goals (crowding, spacing, bite, finishing touches)",
    "Ask if you’ll need attachments, elastics, or refinements",
    "Review estimated timing and how often you’ll check in",
    "Confirm what’s included in the plan and retainer options",
    "Bring insurance information so we can help estimate benefits",
  ];

  const lastUpdated = "December 2025";

  const providerHighlights = [
    "University of the Pacific Arthur A. Dugoni School of Dentistry graduate",
    "Member of the American Dental Association (ADA), California Dental Association (CDA), and Santa Clara County Dental Society (SCCDS)",
    "Invisalign treatment plans created and monitored by Dr. Wong using 3D digital scans",
    "Clear check-ins and retainer guidance to help results stay stable",
  ];

  const ageGroups = [
    {
      title: "Invisalign for Teens",
      description: "Special features designed for teenage lifestyles, including compliance indicators and replacement aligners for lost or broken ones.",
      features: ["Blue dot wear indicators", "Replacement aligners included", "Designed for growing mouths"]
    },
    {
      title: "Invisalign for Adults",
      description: "Professional discretion meets effective treatment. Perfect for working adults who want to improve their smile without compromising their professional image.",
      features: ["Completely discreet treatment", "Minimal lifestyle disruption", "No dietary restrictions"]
    }
  ];

  const serviceSchema = buildServiceSchema({
    name: "Invisalign Clear Aligners",
    description:
      "Invisalign clear aligner treatment from a Palo Alto Invisalign dentist with digital scans, personalized plans, and flexible checkups for teens and adults.",
    slug: "/invisalign",
    image: "/images/invisalign-treatment.jpg",
    serviceType: "Invisalign clear aligner treatment",
  });

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Invisalign", path: "/invisalign" },
  ];
  const invisalignBreadcrumbs = buildBreadcrumbSchema(breadcrumbItems);
  const invisalignFaqSchema = buildFAQSchema(invisalignFaqs, "/invisalign");
  const invisalignHowToSchema = buildHowToSchema({
    name: "Invisalign treatment steps in Palo Alto",
    description:
      "A step-by-step overview of Invisalign treatment with Dr. Wong in Palo Alto, from consultation to aligner delivery.",
    steps: treatmentProcess.map((step) => ({
      title: step.title,
      description: step.description,
      duration: step.duration,
    })),
    pagePath: "/invisalign",
  });

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/dental-implants",
      anchorText: "Dental implants in Palo Alto",
      description:
        "Replace missing teeth with stable, natural-looking implant restorations.",
    },
    {
      href: "/dental-veneers",
      anchorText: "Cosmetic veneers in Palo Alto",
      description:
        "Brighten and reshape your smile with custom porcelain or composite veneers.",
    },
    {
      href: "/zoom-whitening",
      anchorText: "ZOOM teeth whitening in Palo Alto",
      description: "Fast, in‑office whitening for noticeably brighter teeth.",
    },
    {
      href: "/emergency-dental",
      anchorText: "Emergency dentist in Palo Alto",
      description: "Same‑day help for toothaches, broken teeth, and trauma.",
    },
    {
      href: "/services",
      anchorText: "All dental services",
    },
  ];

  const pageSchemas = [
    serviceSchema,
  ];

  if (invisalignBreadcrumbs) {
    pageSchemas.push(invisalignBreadcrumbs);
  }

  if (invisalignFaqSchema) {
    pageSchemas.push(invisalignFaqSchema);
  }
  if (invisalignHowToSchema) {
    pageSchemas.push(invisalignHowToSchema);
  }

  return (
    <>
      <MetaTags 
        title={pageTitles.invisalign}
        description={pageDescriptions.invisalign}
      />
      <StructuredData data={pageSchemas} />
      <PageBreadcrumbs items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#F5F9FC] to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-semibold mb-5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Palo Alto, CA
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#333333] mb-6">
                Invisalign® in Palo Alto, CA
              </h1>
              <p className="text-xl text-[#333333] max-w-3xl mb-4">
                Looking for an Invisalign dentist in Palo Alto? Dr. Christopher B. Wong provides clear aligner
                treatment for adults and teens using 3D digital scans, personalized planning, and checkups built
                for busy schedules.
              </p>
              <p className="text-lg text-[#333333] max-w-3xl mb-4">
                Invisalign Palo Alto patients appreciate clear timelines, conservative tooth movement, and a care
                team that keeps treatment comfortable from start to finish.
              </p>
              <p className="text-base text-[#333333] max-w-3xl mb-6">
                Our Cambridge Ave office welcomes Invisalign patients from Palo Alto, Menlo Park, Stanford, and
                Mountain View.
              </p>

              <ul className="grid gap-3 sm:grid-cols-2 text-sm text-slate-700 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  Digital scan and step‑by‑step plan
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  Removable for eating and cleaning
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  Helpful for crowding, gaps, and bite issues
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  Retainers to maintain your result
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/schedule#appointment">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3">
                    Schedule an Invisalign consult
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href={`tel:${officeInfo.phoneE164}`}>
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5 px-8 py-3 w-full sm:w-auto"
                  >
                    Call {officeInfo.phone}
                    <Phone className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5"
            >
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Dr. Wong for Invisalign */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#333333] mb-4">
                Why patients choose Dr. Wong for Invisalign in Palo Alto
              </h2>
              <p className="text-[#333333] text-lg mb-6 max-w-3xl">
                Your Invisalign plan is created and reviewed by a Palo Alto Invisalign dentist using careful
                diagnostics and a conservative approach so you can move through treatment confidently.
              </p>
              <ul className="space-y-3 text-[#333333]">
                {providerHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-slate-600">
                Want the full bio?{" "}
                <Link href="/about" className="text-primary font-semibold hover:underline">
                  Meet Dr. Wong
                </Link>
                .
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-primary font-semibold">
                Reviewed by Dr. Wong
              </p>
              <p className="text-xl font-bold text-[#333333] mt-2">
                {doctorInfo.name}, {doctorInfo.title}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Invisalign plans are tailored and reviewed by Dr. Wong for accuracy, comfort, and long‑term stability.
              </p>
              <Link
                href="/about"
                className="mt-4 inline-flex items-center text-sm font-semibold text-primary hover:underline"
              >
                View credentials and experience
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What is Invisalign */}
      <section className="py-16 bg-[#F5F9FC]" id="what-is-invisalign">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold font-heading text-[#333333] mb-6">
                What is Invisalign, and how does it work?
              </h2>
              <p className="text-[#333333] mb-4 text-lg">
                Invisalign® is a clear aligner system that straightens teeth using a series of custom‑made,
                removable trays. Each set makes small, controlled movements, and you progress through aligners
                as directed so your smile improves step by step.
              </p>
              <p className="text-[#333333] mb-6 text-lg">
                Because aligners are removable, many Palo Alto patients like that they can eat normally and
                keep up with brushing and flossing. Your plan is based on a comprehensive exam and a digital scan,
                so we can map tooth movement precisely and monitor progress along the way.
              </p>
              <h3 className="text-xl font-semibold text-[#333333] mb-4">Invisalign Can Treat:</h3>
              <div className="space-y-3">
                {conditions.map((condition, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                    <span className="text-[#333333]">{condition}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
	              <OptimizedImage
	                src="/images/invisalign-treatment.jpg"
	                alt="Invisalign clear aligners treatment at Dr. Christopher B. Wong's Palo Alto practice"
	                className="w-full h-56 sm:h-72 md:h-96 object-cover rounded-lg shadow-lg"
	              />
              <div className="absolute inset-0 bg-primary/10 rounded-lg"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Candidacy */}
      <section className="py-16 bg-white" id="invisalign-candidacy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#333333] mb-6">
                Is Invisalign right for you?
              </h2>
              <p className="text-[#333333] text-lg mb-6 max-w-3xl">
                Invisalign can treat many alignment and bite concerns, but the best option depends on your bite,
                gum health, and goals. The most important factor for success is consistent wear—typically 20–22
                hours per day.
              </p>

              <h3 className="text-xl font-semibold text-[#333333] mb-4">Often a good fit for:</h3>
              <div className="space-y-3">
                {candidacyGoodFit.map((item) => (
                  <div key={item} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                    <span className="text-[#333333]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-[#333333] mb-4">
                  A few important considerations
                </h3>
                <div className="space-y-3">
                  {candidacyConsiderations.map((item) => (
                    <div key={item} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                      <span className="text-[#333333]">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm text-slate-600">
                  If aligners aren’t the best option for long‑term stability, we’ll explain alternatives and help you
                  choose the right path.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits of Invisalign */}
      <section className="py-16 bg-[#F5F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#333333] mb-6">
              Why Choose Invisalign?
            </h2>
            <p className="text-[#333333] max-w-3xl mx-auto">
              Invisalign offers advantages over traditional braces for many teens and adults, especially if you
              want a discreet option that’s easier to clean around and fits a busy Palo Alto routine.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {invisalignBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-lg p-6 text-center"
              >
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold font-heading text-[#333333] mb-3">
                  {benefit.title}
                </h3>
                <p className="text-[#333333]">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Confidence */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#1F2933]">
              Clear aligners with real-life results
            </h2>
            <p className="mt-4 text-sm text-[#4B5563] sm:text-base">
              Patients appreciate the modern technology, approachable team, and flexible care behind every Invisalign plan.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {invisalignTestimonials.map((testimonial) => (
              <TestimonialQuote key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Treatment Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#333333] mb-6">
              Your Invisalign Journey
            </h2>
            <p className="text-[#333333] max-w-3xl mx-auto">
              From consultation to your new smile, here's what you can expect during your Invisalign treatment 
              at our Palo Alto practice.
            </p>
          </motion.div>

          <div className="space-y-8">
            {treatmentProcess.map((step, index) => (
              <motion.div
                key={index}
                id={`step-${step.step}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1 bg-[#F5F9FC] rounded-lg p-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-4">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-heading text-[#333333]">
                        {step.title}
                      </h3>
                      <span className="text-primary font-medium">{step.duration}</span>
                    </div>
                  </div>
                  <p className="text-[#333333]">{step.description}</p>
                </div>
	                <div className="w-full md:w-64 lg:w-72 xl:w-80 aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
	                  <OptimizedImage
	                    src={`/images/invisalign-step-${step.step}.png`}
	                    alt={`Invisalign treatment step ${step.step}: ${step.title}`}
	                    className="w-full h-full object-cover"
	                  />
	                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-14">
            <h3 className="text-2xl md:text-3xl font-bold font-heading text-[#333333] mb-4">
              Attachments, elastics, and refinements—what to expect
            </h3>
            <p className="text-[#333333] max-w-3xl mb-8">
              Many Invisalign plans include small details that make aligners more effective. We’ll explain what
              your specific case needs so there are no surprises.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#F5F9FC] rounded-lg p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-[#333333] mb-2">Attachments</h4>
                <p className="text-[#333333]">
                  Tiny, tooth‑colored shapes bonded to select teeth help aligners grip and guide movements like
                  rotations and root control.
                </p>
              </div>
              <div className="bg-[#F5F9FC] rounded-lg p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-[#333333] mb-2">Elastics (rubber bands)</h4>
                <p className="text-[#333333]">
                  Some cases use elastics to improve bite relationships. Not everyone needs them, and we’ll show you
                  exactly how to wear them if they’re part of your plan.
                </p>
              </div>
              <div className="bg-[#F5F9FC] rounded-lg p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-[#333333] mb-2">Refinements & retainers</h4>
                <p className="text-[#333333]">
                  Refinement aligners are common near the end to fine‑tune details. After treatment, retainers help
                  protect your new alignment long‑term.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Age-Specific Options */}
      <section className="py-16 bg-[#F5F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#333333] mb-6">
              Invisalign for Every Age
            </h2>
            <p className="text-[#333333] max-w-3xl mx-auto">
              Whether you're a teenager or an adult, Invisalign offers age-appropriate solutions 
              designed to fit your lifestyle and orthodontic needs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {ageGroups.map((group, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-lg p-8"
              >
                <div className="flex items-center mb-4">
                  <Users className="h-8 w-8 text-primary mr-3" />
                  <h3 className="text-2xl font-bold font-heading text-[#333333]">
                    {group.title}
                  </h3>
                </div>
                <p className="text-[#333333] mb-6">{group.description}</p>
                <h4 className="font-semibold text-[#333333] mb-3">Key Features:</h4>
                <div className="space-y-2">
                  {group.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <Star className="h-4 w-4 text-primary mt-1 mr-2 flex-shrink-0" />
                      <span className="text-[#333333]">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dr. Wong's Approach */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
	              <OptimizedImage
	                src="/images/dr-wong-polaroids.webp"
	                alt="Dr. Christopher Wong in his dental practice - professional polaroid photos"
	                className="w-full h-56 sm:h-72 md:h-96 object-cover rounded-lg shadow-lg"
	              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold font-heading text-[#333333] mb-6">
                Dr. Wong's Personalized Approach
              </h2>
              <p className="text-[#333333] mb-6">
                Dr. Christopher B. Wong combines years of experience with the latest Invisalign technology 
                to create personalized treatment plans. His careful attention to detail ensures optimal 
                results while maintaining your comfort throughout the process.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Shield className="h-6 w-6 text-primary mt-1 mr-4" />
                  <div>
                    <h4 className="font-semibold text-[#333333] mb-1">Comprehensive Evaluation</h4>
                    <p className="text-[#333333]">Thorough assessment to ensure Invisalign is the right choice for your needs.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-primary mt-1 mr-4" />
                  <div>
                    <h4 className="font-semibold text-[#333333] mb-1">Regular Monitoring</h4>
                    <p className="text-[#333333]">Scheduled check-ups to ensure your treatment is progressing as planned.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Caring for Your Aligners */}
      <section className="py-16 bg-[#F5F9FC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold font-heading text-[#333333] mb-6">
              Caring for Your Invisalign Aligners
            </h2>
            <p className="text-[#333333] max-w-2xl mx-auto">
              Proper care of your aligners is essential for successful treatment and maintaining good oral hygiene.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {careInstructions.map((instruction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start bg-white p-6 rounded-lg shadow-md"
              >
                <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                <span className="text-[#333333]">{instruction}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost and next steps */}
      <section className="py-16 bg-white" id="invisalign-cost">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#333333] mb-6">
                Invisalign cost in Palo Alto: what affects it
              </h2>
              <p className="text-[#333333] text-lg mb-6 max-w-3xl">
                Invisalign fees vary because every bite and timeline is different. After your exam and digital scan,
                we’ll share a clear, written estimate and walk through options for insurance and payments.
              </p>

              <h3 className="text-xl font-semibold text-[#333333] mb-4">
                Common factors that influence cost
              </h3>
              <div className="space-y-3">
                {costFactors.map((factor) => (
                  <div key={factor} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                    <span className="text-[#333333]">{factor}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/schedule#appointment">
                  <Button className="bg-primary text-white hover:bg-primary/90 px-8 py-3">
                    Request a consultation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href={`tel:${officeInfo.phoneE164}`}>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 px-8 py-3">
                    Call {officeInfo.phone}
                  </Button>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-[#333333] mb-4">
                  Your consultation checklist
                </h3>
                <div className="space-y-3">
                  {consultationChecklist.map((item) => (
                    <div key={item} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                      <span className="text-[#333333]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-[#333333] mb-2">
                  See a real patient story
                </h3>
                <p className="text-[#333333] mb-5">
                  Explore a case study that combines Invisalign with whitening and bonding to create a natural,
                  confident smile.
                </p>
                <Link href="/patient-stories#invisalign-whitening-bonding-66yo">
                  <Button className="bg-primary text-white hover:bg-primary/90">
                    View Invisalign case study
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-slate-500">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </section>

      <FAQSection
        title="Invisalign FAQs"
        subtitle="Clear answers to common questions about clear aligner treatment."
        items={invisalignFaqs}
        className="bg-[#F5F9FC]"
      />

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-[#F5F9FC] p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#1F2933] mb-3">
              Want the Invisalign details?
            </h2>
            <p className="text-slate-700 text-lg leading-relaxed mb-6">
              Explore wear time tips, attachment guidance, refinements, and retainer
              planning in our Invisalign resources hub.
            </p>
            <Link href="/invisalign/resources">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Explore Invisalign resources
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <RelatedServices
        items={relatedServices}
        title="More ways we can help"
        subtitle="Explore other services offered by Dr. Wong in Palo Alto."
      />

      <RelatedServicePosts
        serviceSlug="invisalign"
        serviceName="Invisalign"
        category="Invisalign"
        ctaHref="/invisalign/resources"
      />

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold font-heading mb-6">
              Ready to Start Your Invisalign Journey?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Schedule your consultation with Dr. Wong today to discover if Invisalign is right for you. 
              Transform your smile discreetly and comfortably.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/schedule#appointment">
                <Button className="bg-white text-primary hover:bg-gray-100 font-medium px-8 py-3">
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href={`tel:${officeInfo.phoneE164}`}>
                <Button className="bg-white text-primary hover:bg-white/90 border-white px-8 py-3">
                  Call {officeInfo.phone}
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Invisalign;
