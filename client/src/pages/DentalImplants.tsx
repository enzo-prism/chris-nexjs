"use client";

import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Heart, Shield, Clock, Smile, Users, Award } from "lucide-react";
import TestimonialQuote from "@/components/testimonials/TestimonialQuote";
import { getTestimonialsByNames } from "@/lib/testimonials";
import StructuredData from "@/components/seo/StructuredData";
import MetaTags from "@/components/common/MetaTags";
import FAQSection from "@/components/common/FAQSection";
import { pageDescriptions, pageTitles } from "@/lib/metaContent";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildHowToSchema,
  buildServiceSchema,
} from "@/lib/structuredData";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import RelatedServices, {
  type RelatedServiceLink,
} from "@/components/common/RelatedServices";
import RelatedServicePosts from "@/components/blog/RelatedServicePosts";

const benefits = [
  "Natural Look and Feel: Implants fuse with your jawbone, becoming a permanent part of your mouth",
  "Exceptional Durability & Longevity: With proper care, dental implants can last a lifetime",
  "Improved Chewing Ability: Eat your favorite foods with confidence and full chewing power",
  "Preservation of Jawbone: Implants stimulate bone, preventing bone loss and maintaining facial structure",
  "No Impact on Adjacent Teeth: Unlike bridges, implants don't require altering healthy neighboring teeth",
  "Enhanced Confidence & Quality of Life: A complete, beautiful smile boosts self-esteem significantly",
  "Easy Maintenance: Care for implants just like natural teeth with regular brushing and flossing"
];

const candidateRequirements = [
  "Good Overall Health: Certain uncontrolled chronic conditions may affect healing",
  "Sufficient Jawbone Density: Adequate bone needed to support the implant",
  "Healthy Gums: Gum disease needs treatment before implant placement",
  "Commitment to Oral Hygiene: Maintaining good oral hygiene is crucial for long-term success",
  "Non-Smokers (Preferred): Smoking can impede healing and increase risk of implant failure"
];

const implantTypes = [
  {
    title: "Single Tooth Implants",
    description: "Ideal for replacing one missing tooth with a natural-looking restoration."
  },
  {
    title: "Multiple Tooth Implants",
    description: "Using individual implants or implant-supported bridges to replace several missing teeth."
  },
  {
    title: "Implant-Supported Dentures",
    description: "Providing a secure and stable alternative to traditional dentures, improving comfort and function."
  },
  {
    title: "All-on-4® / All-on-X Concepts",
    description: "For patients needing to replace a full arch of teeth, using strategically placed implants to support a full prosthetic arch."
  }
];

const procedureSteps = [
  {
    title: "Initial Consultation and Treatment Planning",
    description: "Comprehensive oral examination, including X-rays and potentially 3D imaging. Discussion of your medical history, smile goals, and treatment options."
  },
  {
    title: "Implant Placement",
    description: "Minor surgical procedure performed under local anesthesia. The titanium implant post is precisely placed into the jawbone."
  },
  {
    title: "Osseointegration (Healing Period)",
    description: "Over the next 3-6 months, the implant post will naturally fuse with your jawbone, creating a strong and stable foundation."
  },
  {
    title: "Abutment Placement",
    description: "Once osseointegration is complete, a small connector piece called an abutment is attached to the top of the implant post."
  },
  {
    title: "Custom Crown Fabrication & Placement",
    description: "Impressions are taken to create a custom-made dental crown that perfectly matches your natural teeth."
  }
];

const careInstructions = [
  "Brush twice daily with a soft-bristled toothbrush and non-abrasive toothpaste",
  "Floss daily, paying special attention around the implant abutment",
  "Attend regular dental check-ups and professional cleanings every six months",
  "Avoid chewing extremely hard items like ice or hard candy directly on the implant",
  "Use a custom nightguard if you clench or grind your teeth"
];

const faqs = [
  {
    question: "Is the dental implant procedure painful?",
    answer: "Most patients report minimal discomfort during the procedure, often comparable to a simple extraction. Local anesthesia is used, and post-operative discomfort is typically manageable with over-the-counter pain relievers."
  },
  {
    question: "How long do dental implants last?",
    answer: "With proper care and regular dental visits, dental implants can last a lifetime. The crown attached to the implant may need replacement after 10-15 years due to normal wear and tear."
  },
  {
    question: "How successful are dental implants?",
    answer: "Dental implants have a very high success rate, typically above 95%, when placed by an experienced implant dentist and properly cared for."
  },
  {
    question: "Can I get a dental implant if I have bone loss?",
    answer: "Yes, in many cases. Bone grafting procedures can augment the existing bone, creating a suitable foundation for implant placement. Dr. Wong will assess this during your consultation."
  },
  {
    question: "How long will the entire dental implant process take?",
    answer: "The entire process can take anywhere from a few months to over a year, depending on the complexity of your case and the healing time required for osseointegration."
  }
];

const DentalImplants = () => {
  const implantTestimonials = getTestimonialsByNames([
    "Sarah L.",
    "Paul Pedersen",
    "Martha Debs",
  ]);

  const implantServiceSchema = buildServiceSchema({
    name: "Dental Implants",
    description:
      "Comprehensive dental implant planning, placement, and restoration for single or multiple missing teeth.",
    slug: "/dental-implants",
  });

  const implantHowToSchema = buildHowToSchema({
    name: "Dental implant treatment process",
    description:
      "Overview of the steps patients complete when receiving dental implants at our Palo Alto office.",
    steps: procedureSteps.map((step) => ({
      title: step.title,
      description: step.description,
    })),
    pagePath: "/dental-implants",
  });

  const implantFaqSchema = buildFAQSchema(faqs, "/dental-implants");
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Dental Implants", path: "/dental-implants" },
  ];
  const implantBreadcrumbs = buildBreadcrumbSchema(breadcrumbItems);

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/invisalign",
      anchorText: "Invisalign in Palo Alto",
      description:
        "Clear aligners to straighten teeth discreetly for teens and adults.",
    },
    {
      href: "/dental-veneers",
      anchorText: "Dental veneers in Palo Alto",
      description:
        "Cosmetic smile upgrades for chips, gaps, and discoloration.",
    },
    {
      href: "/zoom-whitening",
      anchorText: "Professional teeth whitening",
      description: "Brighten your smile quickly with in‑office ZOOM whitening.",
    },
    {
      href: "/emergency-dental",
      anchorText: "Emergency dental care in Palo Alto",
      description: "Fast treatment when you have sudden pain or damage.",
    },
    {
      href: "/services#restorative-dentistry",
      anchorText: "Restorative dentistry",
      description: "Fillings, crowns, and bridges to restore function.",
    },
  ];

  const dentalImplantSchemas = [implantServiceSchema];

  if (implantHowToSchema) {
    dentalImplantSchemas.push(implantHowToSchema);
  }

  if (implantFaqSchema) {
    dentalImplantSchemas.push(implantFaqSchema);
  }

  if (implantBreadcrumbs) {
    dentalImplantSchemas.push(implantBreadcrumbs);
  }

  return (
    <>
      <MetaTags 
        title={pageTitles.dentalImplants}
        description={pageDescriptions.dentalImplants}
      />
      <StructuredData data={dentalImplantSchemas} />
      <PageBreadcrumbs items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-heading mb-4 sm:mb-6 leading-tight">
              Dental Implants in Palo Alto: A Comprehensive Guide to Restoring Your Smile
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              Are you missing one or more teeth and looking for a permanent, natural-looking solution in Palo Alto? 
              Dental implants offer a revolutionary way to restore not just the appearance of your smile, but its full function and health.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              At the practice of Christopher B. Wong, DDS, we specialize in advanced implant dentistry, 
              providing durable, comfortable, and aesthetically pleasing tooth replacement options.
            </p>
            <Link href="/schedule">
              <Button className="bg-white text-primary hover:bg-gray-100 font-medium px-6 py-3 sm:px-8 sm:py-3 text-base sm:text-lg w-full sm:w-auto">
                <span className="hidden sm:inline">Schedule Your Dental Implant Consultation Today</span>
                <span className="sm:hidden">Schedule Consultation</span>
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#333333] mb-4 sm:mb-6 leading-tight">
              Why Choose Dental Implants? The Unmatched Benefits for Your Smile & Health
            </h2>
            <p className="text-[#333333] text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
              Dental implants are widely recognized as the gold standard for tooth replacement, and for good reason. 
              Unlike other options, they offer unique advantages:
            </p>
          </motion.div>

          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6"
            >
              {benefits.slice(0, 4).map((benefit, index) => (
                <div key={index} className="flex items-start bg-gray-50 p-4 rounded-lg">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-1 mr-3 sm:mr-4 flex-shrink-0" />
                  <p className="text-[#333333] text-sm sm:text-base leading-relaxed">{benefit}</p>
                </div>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6"
            >
              {benefits.slice(4).map((benefit, index) => (
                <div key={index} className="flex items-start bg-gray-50 p-4 rounded-lg">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-1 mr-3 sm:mr-4 flex-shrink-0" />
                  <p className="text-[#333333] text-sm sm:text-base leading-relaxed">{benefit}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Candidacy Section */}
      <section className="py-12 sm:py-16 bg-[#F5F9FC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#333333] mb-4 sm:mb-6 leading-tight">
              Are You a Candidate for Dental Implants in Palo Alto?
            </h2>
            <p className="text-[#333333] text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
              Many individuals in Palo Alto missing teeth are excellent candidates for dental implants. 
              Generally, ideal candidates should have:
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg shadow-lg p-6 sm:p-8"
          >
            <div className="space-y-4 sm:space-y-6">
              {candidateRequirements.map((requirement, index) => (
                <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-1 mr-3 sm:mr-4 flex-shrink-0" />
                  <p className="text-[#333333] text-sm sm:text-base leading-relaxed">{requirement}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 sm:mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-[#333333] text-sm sm:text-base leading-relaxed">
                During your initial consultation, Dr. Wong will conduct a thorough examination, including advanced 3D imaging 
                (CBCT scans if necessary), to determine if dental implants are the right solution for your specific needs and oral health condition.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Procedure Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#333333] mb-4 sm:mb-6 leading-tight">
              The Dental Implant Procedure: What to Expect with Dr. Wong
            </h2>
            <p className="text-[#333333] text-base sm:text-lg leading-relaxed">
              The dental implant process is a multi-step journey tailored to your individual needs. 
              Dr. Wong and our compassionate Palo Alto team will guide you through each phase:
            </p>
          </motion.div>

          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {procedureSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-lg p-4 sm:p-6"
              >
                <div className="flex items-start">
                  <div className="bg-primary text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 font-bold text-sm sm:text-base">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#333333] mb-2 sm:mb-3 leading-tight">{step.title}</h3>
                    <p className="text-[#333333] text-sm sm:text-base leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Types of Implants Section */}
      <section className="py-12 sm:py-16 bg-[#F5F9FC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h3 className="text-2xl sm:text-3xl font-bold font-heading text-[#333333] mb-4 sm:mb-6 leading-tight">
              Types of Dental Implants We Offer
            </h3>
            <p className="text-[#333333] text-base sm:text-lg leading-relaxed">
              Depending on your specific situation, Dr. Wong may recommend different types of implant solutions:
            </p>
          </motion.div>

          <div className="space-y-4 sm:space-y-6 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-6 lg:gap-8">
            {implantTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-lg p-5 sm:p-6"
              >
                <h4 className="text-lg sm:text-xl font-semibold text-[#333333] mb-3 leading-tight">{type.title}</h4>
                <p className="text-[#333333] text-sm sm:text-base leading-relaxed">{type.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Success Stories */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h3 className="text-2xl sm:text-3xl font-bold font-heading text-[#1F2933] leading-tight">
              Restoring confidence with advanced implant care
            </h3>
            <p className="mt-4 text-sm text-[#4B5563] sm:text-base">
              Patients trust Dr. Wong and our team for transparent guidance, same-day support, and beautiful, lasting results.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {implantTestimonials.map((testimonial) => (
              <TestimonialQuote key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Cost Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold font-heading text-[#333333] mb-6">
              Investing in Your Smile: Understanding Dental Implant Cost in Palo Alto
            </h2>
            <p className="text-[#333333] text-lg mb-8">
              The cost of dental implants can vary based on several factors:
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-lg p-8"
          >
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                <span className="text-[#333333]">The number of implants needed</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                <span className="text-[#333333]">The type of restoration (crown, bridge, denture)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                <span className="text-[#333333]">The need for preparatory procedures like bone grafting or sinus lifts</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                <span className="text-[#333333]">The complexity of your individual case</span>
              </li>
            </ul>
            <p className="text-[#333333] mb-4">
              While dental implants may represent a more significant initial investment than other tooth replacement options, 
              their longevity, durability, and numerous benefits often make them the most cost-effective solution over time.
            </p>
            <p className="text-[#333333]">
              During your consultation, we will provide a transparent and detailed breakdown of all associated costs for your specific treatment plan. 
              Our Palo Alto dental office also offers information on financing options to help make this life-changing treatment more accessible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Care Instructions Section */}
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
              Caring for Your Dental Implants for Lifelong Success
            </h2>
            <p className="text-[#333333] text-lg">
              Maintaining your dental implants is straightforward and similar to caring for your natural teeth:
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="space-y-4">
              {careInstructions.map((instruction, index) => (
                <div key={index} className="flex items-start">
                  <Shield className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                  <span className="text-[#333333]">{instruction}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Dr. Wong Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold font-heading text-[#333333] mb-6">
              Why Choose Dr. Christopher B. Wong for Your Dental Implants in Palo Alto?
            </h2>
            <p className="text-[#333333] text-lg">
              Choosing the right dentist for your dental implants is crucial for a successful outcome. Dr. Christopher B. Wong offers:
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Award, title: "Experience and Expertise", desc: "Extensive training and experience in implant dentistry, from single tooth replacements to complex cases." },
              { icon: Clock, title: "Advanced Technology", desc: "State-of-the-art diagnostic and treatment technology for precise planning and placement." },
              { icon: Heart, title: "Personalized Care", desc: "We take time to understand your individual needs and goals, creating a tailored treatment plan." },
              { icon: Shield, title: "Conservative Approach", desc: "Committed to preserving natural tooth structure and recommending implants when they're truly the best solution." },
              { icon: Smile, title: "Comfortable Environment", desc: "We strive to make your experience comfortable and stress-free, offering sedation options if needed." },
              { icon: Users, title: "Long-Term Health Focus", desc: "Our goal is to restore your smile and ensure its health and function for years to come." }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#333333] mb-3">{feature.title}</h3>
                <p className="text-[#333333]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FAQSection
        title="Frequently Asked Questions About Dental Implants"
        items={faqs}
        className="bg-[#F5F9FC] py-16"
      />

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="See other treatments we offer in Palo Alto."
      />

      <RelatedServicePosts serviceSlug="dental-implants" serviceName="Dental Implants" />

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4 sm:mb-6 leading-tight">
              Take the Next Step Towards a Renewed Smile in Palo Alto
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              If you're ready to learn more about how dental implants can transform your smile, health, and confidence, 
              we invite you to schedule a consultation with Dr. Christopher B. Wong. Contact our Palo Alto dental practice today 
              – let us help you rediscover the joy of a complete and beautiful smile.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
              <Link href="/schedule">
                <Button className="bg-white text-primary hover:bg-gray-100 font-medium px-6 py-3 sm:px-8 sm:py-3 w-full sm:w-auto">
                  <span className="hidden sm:inline">Schedule Your Consultation</span>
                  <span className="sm:hidden">Schedule Consultation</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-white border-2 text-white bg-white/10 hover:bg-white/20 px-6 py-3 sm:px-8 sm:py-3 font-medium w-full sm:w-auto">
                  Contact Our Practice
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default DentalImplants;
