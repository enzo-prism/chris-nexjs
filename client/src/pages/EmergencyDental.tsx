import { Phone, Clock, AlertTriangle, CheckCircle, ArrowRight, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import MetaTags from "@/components/common/MetaTags";
import StructuredData from "@/components/seo/StructuredData";
import { motion } from "framer-motion";
import TestimonialQuote from "@/components/testimonials/TestimonialQuote";
import { getTestimonialsByNames } from "@/lib/testimonials";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildHowToSchema,
  buildServiceSchema,
  type FAQEntry,
} from "@/lib/structuredData";
import RelatedServicePosts from "@/components/blog/RelatedServicePosts";
import { pageDescriptions, pageTitles } from "@/lib/metaContent";
import { officeInfo } from "@/lib/data";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import FAQSection from "@/components/common/FAQSection";
import RelatedServices, {
  type RelatedServiceLink,
} from "@/components/common/RelatedServices";

const emergencyFaqs: FAQEntry[] = [
  {
    question: "What counts as a dental emergency?",
    answer:
      "A dental emergency is any problem that causes significant pain, bleeding, swelling, or risk of losing a tooth. Examples include severe toothaches, a knocked‑out tooth, a broken tooth, facial swelling from infection, or trauma to the mouth. If you’re unsure, it’s always safer to call and ask.",
  },
  {
    question: "Do you offer an emergency dentist in Palo Alto?",
    answer: `Yes. If you need an emergency dentist in Palo Alto, call ${officeInfo.phone} right away. We prioritize same-day urgent visits whenever possible and will guide you on the next best steps.`,
  },
  {
    question: "Can you see me the same day?",
    answer:
      "We prioritize urgent cases and often can see patients the same day. The sooner you contact us, the more likely we can reserve a time to diagnose the issue and relieve pain quickly.",
  },
  {
    question: "What should I do if I knock out a tooth?",
    answer:
      "Handle the tooth by the crown (not the root), gently rinse it if dirty, and keep it moist—either in milk or against your cheek. Time matters, so seek care right away. Prompt treatment can sometimes save the tooth.",
  },
  {
    question: "Do you treat emergencies for new patients?",
    answer:
      "Yes. If you’re new to our practice and have a sudden dental problem, we’ll do our best to help you promptly. We’ll focus on getting you comfortable and explaining the next steps clearly.",
  },
  {
    question: "How much does an emergency visit cost?",
    answer:
      "Emergency care varies depending on what we find and what treatment is needed. We’ll review your options and costs after the exam. Many PPO plans help cover emergency evaluations, and we can discuss payment options if needed.",
  },
  {
    question: "Is it okay to wait if the pain comes and goes?",
    answer:
      "Intermittent pain can still signal a serious problem like deep decay or infection. Waiting can make treatment more complex. It’s best to be evaluated early, even if symptoms feel temporary.",
  },
];

const EmergencyDental = () => {
  const emergencyTypes = [
    {
      title: "Severe Toothache",
      description: "Intense, persistent tooth pain that interferes with daily activities",
      symptoms: ["Throbbing pain", "Pain when chewing", "Sensitivity to hot/cold", "Swelling around tooth"],
      immediateAction: "Rinse with warm salt water, take over-the-counter pain medication, apply cold compress"
    },
    {
      title: "Knocked-Out Tooth",
      description: "Complete tooth displacement due to trauma or injury",
      symptoms: ["Missing tooth", "Bleeding from socket", "Pain in affected area"],
      immediateAction: "Keep tooth moist, handle by crown only, seek immediate dental care within 30 minutes"
    },
    {
      title: "Broken or Chipped Tooth",
      description: "Fractured tooth structure from injury or biting hard objects",
      symptoms: ["Visible crack or chip", "Sharp edges", "Pain when biting", "Sensitivity"],
      immediateAction: "Save any broken pieces, rinse mouth with warm water, apply cold compress for swelling"
    },
    {
      title: "Lost Filling or Crown",
      description: "Dental restoration becomes loose or falls out completely",
      symptoms: ["Exposed tooth structure", "Sensitivity", "Discomfort when eating"],
      immediateAction: "Keep crown/filling safe, use dental cement or sugar-free gum as temporary protection"
    },
    {
      title: "Dental Abscess",
      description: "Serious infection around tooth root or gums requiring immediate attention",
      symptoms: ["Severe pain", "Facial swelling", "Fever", "Bad taste in mouth", "Swollen lymph nodes"],
      immediateAction: "Rinse with salt water, take pain medication, seek immediate dental care - do not delay"
    },
    {
      title: "Soft Tissue Injury",
      description: "Cuts, tears, or injuries to gums, tongue, cheeks, or lips",
      symptoms: ["Bleeding", "Pain", "Visible cuts or tears", "Swelling"],
      immediateAction: "Clean area gently, apply pressure to control bleeding, use cold compress for swelling"
    }
  ];

  const emergencySteps = [
    {
      step: "1",
      title: "Stay Calm",
      description: "Take a deep breath and assess the situation. Most dental emergencies can be effectively treated when addressed promptly."
    },
    {
      step: "2", 
      title: "Contact Us Immediately",
      description: `Call our emergency line at ${officeInfo.phone}. We prioritize same-day emergency visits whenever possible and will guide you on next steps.`
    },
    {
      step: "3",
      title: "Follow First Aid",
      description: "Apply appropriate first aid measures while en route to our office. This can help manage pain and prevent further damage."
    },
    {
      step: "4",
      title: "Preserve Evidence",
      description: "Save any broken tooth pieces, crowns, or fillings. These may be reusable in your treatment."
    }
  ];

  const emergencyTestimonials = getTestimonialsByNames([
    "Madison Ho",
    "Paul Pedersen",
    "Bill Quarre",
    "Andrew",
  ]);

  const preventionTips = [
    "Wear a mouthguard during sports and physical activities",
    "Avoid chewing ice, hard candies, or non-food items",
    "Don't use teeth as tools to open packages or bottles",
    "Maintain regular dental check-ups to catch problems early",
    "Keep emergency dental kit with pain relievers and dental cement",
    "Know your dentist's emergency contact information"
  ];

  const emergencyServiceSchema = buildServiceSchema({
    name: "Emergency Dental Care",
    description:
      "Emergency dentist in Palo Alto providing same-day care for toothaches, broken teeth, infections, and dental trauma.",
    slug: "/emergency-dental",
    serviceType: "Emergency dentist",
    areaServed: ["Palo Alto", "Stanford", "Menlo Park", "Mountain View"],
  });

  const emergencyHowTo = buildHowToSchema({
    name: "What to do during a dental emergency",
    description:
      "Immediate steps Palo Alto patients should take before arriving at our emergency dentist.",
    steps: emergencySteps.map((step) => ({
      title: step.title,
      description: step.description,
    })),
    pagePath: "/emergency-dental",
  });

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Emergency Dental", path: "/emergency-dental" },
  ];
  const emergencyBreadcrumbs = buildBreadcrumbSchema(breadcrumbItems);
  const emergencyFaqSchema = buildFAQSchema(emergencyFaqs, "/emergency-dental");

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/services#preventive-dentistry",
      anchorText: "Preventive dentistry in Palo Alto",
      description: "Routine exams and cleanings to avoid emergencies.",
    },
    {
      href: "/dental-implants",
      anchorText: "Dental implants",
      description: "Long‑term solutions for missing or severely damaged teeth.",
    },
    {
      href: "/invisalign",
      anchorText: "Invisalign clear aligners",
      description: "Straighten teeth after urgent issues are resolved.",
    },
    {
      href: "/dental-veneers",
      anchorText: "Dental veneers",
      description: "Cosmetic repairs for chips, cracks, and discoloration.",
    },
    {
      href: "/services",
      anchorText: "See all services",
    },
  ];

  const emergencySchemas = [emergencyServiceSchema];

  if (emergencyHowTo) {
    emergencySchemas.push(emergencyHowTo);
  }

  if (emergencyBreadcrumbs) {
    emergencySchemas.push(emergencyBreadcrumbs);
  }

  if (emergencyFaqSchema) {
    emergencySchemas.push(emergencyFaqSchema);
  }

  const lastUpdated = "December 2025";

  return (
    <>
      <MetaTags 
        title={pageTitles.emergencyDental}
        description={pageDescriptions.emergencyDental}
      />
      <StructuredData data={emergencySchemas} />
      <PageBreadcrumbs items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <AlertTriangle className="h-16 w-16 text-orange-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#333333] mb-6">
              Emergency Dentist in Palo Alto, CA
            </h1>
            <p className="text-xl text-[#333333] max-w-4xl mx-auto mb-8">
              If you need an emergency dentist in Palo Alto, Dr. Christopher B. Wong provides same-day care
              for urgent toothaches, broken teeth, swelling, and dental trauma. Call now so we can guide you
              to fast relief and clear next steps.
            </p>
            
            {/* Emergency Contact */}
            <div className="bg-primary text-white rounded-lg p-6 max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-center mb-4">
                <Phone className="h-8 w-8 mr-3" />
                <div>
                  <h3 className="text-xl font-bold">Emergency Line</h3>
                  <p className="text-blue-100">Call for same-day emergency dental care</p>
                </div>
              </div>
              <a
                href={`tel:${officeInfo.phoneE164}`}
                className="text-3xl font-bold hover:text-blue-100 transition-colors"
              >
                {officeInfo.phone}
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`tel:${officeInfo.phoneE164}`}>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-8 py-3">
                  Call Emergency Line
                  <Phone className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <Link href="/contact">
                <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-3">
                  Contact Information
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Local emergency dentist info */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#333333] mb-4">
                Emergency dentist in Palo Alto, close to home
              </h2>
              <p className="text-[#333333] text-lg mb-6">
                Our emergency dentist in Palo Alto helps patients from Palo Alto, Stanford, Menlo Park, and
                Mountain View. Call for fast guidance, and we will prioritize urgent appointments whenever possible.
              </p>
              <p className="text-[#333333] text-base">
                If you have uncontrolled bleeding, trouble breathing, or rapidly worsening facial swelling,
                seek emergency medical care right away.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-6 shadow-sm space-y-4">
              <div>
                <p className="text-sm font-semibold tracking-wide text-slate-900 uppercase">Office location</p>
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
              <div>
                <p className="text-sm font-semibold tracking-wide text-slate-900 uppercase">Hours</p>
                <p className="mt-2 text-slate-700 leading-relaxed text-sm">
                  Mon–Thu: {officeInfo.hours.monday}
                  <br />
                  Fri: {officeInfo.hours.friday}
                  <br />
                  Sat–Sun: {officeInfo.hours.saturday}
                </p>
              </div>
              <p className="text-xs text-slate-500">Reviewed by Dr. Wong · Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </section>

      {/* When to Seek Emergency Care */}
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
              Common Dental Emergencies
            </h2>
            <p className="text-[#333333] max-w-3xl mx-auto">
              Recognize the signs and know what to do before you reach our office. Quick action can often 
              save your tooth and reduce pain and complications.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {emergencyTypes.map((emergency, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-orange-50 rounded-lg border-2 border-orange-100 p-6"
              >
                <h3 className="text-xl font-bold font-heading text-[#333333] mb-3">
                  {emergency.title}
                </h3>
                <p className="text-[#333333] mb-4">
                  {emergency.description}
                </p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-[#333333] mb-2">Symptoms:</h4>
                  <ul className="space-y-1">
                    {emergency.symptoms.map((symptom, idx) => (
                      <li key={idx} className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-[#333333]">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-orange-200 pt-4">
                  <h4 className="font-semibold text-[#333333] mb-2">Immediate Action:</h4>
                  <p className="text-sm text-[#333333] bg-white p-3 rounded border-l-4 border-orange-600">
                    {emergency.immediateAction}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Response Steps */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#333333] mb-6">
              What to Do in a Dental Emergency
            </h2>
            <p className="text-[#333333] max-w-2xl mx-auto">
              Follow these steps to handle your dental emergency effectively while getting to our office.
            </p>
          </motion.div>

          <div className="space-y-6">
            {emergencySteps.map((step, index) => (
              <motion.div
                key={index}
                id={`step-${step.step}`}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex items-start bg-white p-6 rounded-lg shadow-md"
              >
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-6 flex-shrink-0">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-[#333333] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[#333333]">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Testimonials */}
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
              Emergency Care Testimonials
            </h2>
            <p className="text-[#333333] max-w-3xl mx-auto">
              Real experiences from patients who received emergency dental care at our Palo Alto practice.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {emergencyTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <TestimonialQuote
                  testimonial={testimonial}
                  className="border-none border-l-4 border-orange-600 bg-orange-50/70"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Same-day Availability */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Clock className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
              Same-day emergency dental care
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Dental emergencies move fast. We reserve time for urgent visits and work to see you the same day
              whenever possible, so you can get relief and a clear plan quickly.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-700 rounded-lg p-6">
                <Shield className="h-8 w-8 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Fast relief</h3>
                <p className="text-blue-100">Prompt evaluation and pain management</p>
              </div>
              <div className="bg-blue-700 rounded-lg p-6">
                <Heart className="h-8 w-8 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Clear next steps</h3>
                <p className="text-blue-100">Focused guidance during stressful moments</p>
              </div>
              <div className="bg-blue-700 rounded-lg p-6">
                <CheckCircle className="h-8 w-8 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Experienced care</h3>
                <p className="text-blue-100">Trusted clinical care for urgent needs</p>
              </div>
            </div>

            <a href={`tel:${officeInfo.phoneE164}`}>
              <Button className="bg-white text-primary hover:bg-gray-100 font-medium px-8 py-3 text-lg">
                Call Emergency Line Now
                <Phone className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Prevention Tips */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold font-heading text-[#333333] mb-6">
              Preventing Dental Emergencies
            </h2>
            <p className="text-[#333333] max-w-2xl mx-auto">
              While accidents happen, many dental emergencies can be prevented with proper care and precautions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {preventionTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start bg-white p-6 rounded-lg shadow-md"
              >
                <CheckCircle className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <span className="text-[#333333]">{tip}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FAQSection
        title="Emergency dental FAQs"
        subtitle="Answers to common questions about urgent dental care."
        items={emergencyFaqs}
        className="bg-white"
      />

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="After urgent care, explore these next steps."
      />

      <RelatedServicePosts serviceSlug="emergency-dental" serviceName="Emergency Dental Care" />

      {/* Final CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold font-heading text-[#333333] mb-6">
              Don't Wait - Get Emergency Dental Care Now
            </h2>
            <p className="text-xl text-[#333333] mb-8 max-w-3xl mx-auto">
              If you're experiencing a dental emergency, time is critical. Contact our emergency dentist in
              Palo Alto for prompt, professional care and clear next steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`tel:${officeInfo.phoneE164}`}>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-8 py-3">
                  Call Emergency Line
                  <Phone className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <Link href="/schedule">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 px-8 py-3">
                  Schedule Regular Visit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default EmergencyDental;
