"use client";

import { CheckCircle, ArrowRight, Shield, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import MetaTags from "@/components/common/MetaTags";
import StructuredData from "@/components/seo/StructuredData";
import { motion } from "framer-motion";
import OptimizedImage from "@/components/seo/OptimizedImage";
import TestimonialQuote from "@/components/testimonials/TestimonialQuote";
import { getTestimonialsByNames } from "@/lib/testimonials";
import {
  buildBreadcrumbSchema,
  buildServiceSchema,
} from "@/lib/structuredData";
import RelatedServicePosts from "@/components/blog/RelatedServicePosts";
import { getSeoForPath } from "@/lib/seo";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import RelatedServices, {
  type RelatedServiceLink,
} from "@/components/common/RelatedServices";

const DentalVeneers = () => {
  const veneerSeo = getSeoForPath("/dental-veneers");
  const veneerTypes = [
    {
      title: "Porcelain Veneers",
      subtitle: "The Gold Standard for a Lasting, Natural Look",
      features: [
        "Natural aesthetics with translucent appearance",
        "Durability & longevity (10-15+ years)",
        "Highly resistant to stains",
        "Conservative tooth preparation",
        "Custom-shaded to match your teeth"
      ],
      process: "Initial consultation, tooth preparation and impression-taking, final bonding appointment",
      idealFor: "Patients seeking a long-lasting, highly aesthetic, and natural-looking solution for significant cosmetic improvements.",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Composite Veneers",
      subtitle: "A Versatile and More Conservative Option",
      features: [
        "Minimally invasive with little to no enamel removal",
        "Same-day transformation possible",
        "Cost-effective option",
        "Easily repairable if needed",
        "Immediate results in one appointment"
      ],
      process: "Applied directly and sculpted in a single appointment",
      idealFor: "Patients looking for a budget-friendly, quicker, and often more conservative solution for minor chips, gaps, or discoloration.",
      lifespan: "5-7 years with proper care",
      color: "bg-sky-50 border-sky-200"
    },
    {
      title: "No-Prep Veneers (Lumineers®)",
      subtitle: "Ultra-Thin for Maximum Enamel Preservation",
      features: [
        "Maximum enamel preservation",
        "May be reversible in some cases",
        "Reduced discomfort and treatment time",
        "No anesthesia typically required",
        "Stain-resistant like traditional porcelain"
      ],
      process: "Quick application with minimal tooth preparation",
      idealFor: "Patients with minor cosmetic imperfections who prioritize preservation of natural tooth enamel.",
      color: "bg-slate-50 border-slate-200"
    }
  ];

  const concerns = [
    "Discolored or stained teeth that don't respond to whitening",
    "Worn down, chipped, or broken teeth", 
    "Misaligned, uneven, or irregularly shaped teeth",
    "Gaps between teeth"
  ];

  const careInstructions = [
    "Brush twice daily with non-abrasive fluoride toothpaste",
    "Floss daily to maintain gum health",
    "Attend regular dental check-ups and cleanings",
    "Avoid biting on hard objects like ice",
    "Don't use teeth to open packages"
  ];

  const veneerTestimonials = getTestimonialsByNames([
    "Kat Vasilakos",
    "Briana Rico",
    "Sarah Chase",
  ]);

  const veneerServiceSchema = buildServiceSchema({
    name: "Dental Veneers",
    description:
      "Custom dental veneers including porcelain, composite, and minimal-prep options to transform your smile.",
    slug: "/dental-veneers",
  });

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Dental Veneers", path: "/dental-veneers" },
  ];
  const veneerBreadcrumbs = buildBreadcrumbSchema(breadcrumbItems);

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/invisalign",
      anchorText: "Invisalign in Palo Alto",
      description: "Straighten teeth with clear aligners for a balanced smile.",
    },
    {
      href: "/zoom-whitening",
      anchorText: "ZOOM whitening in Palo Alto",
      description: "Remove stains quickly with in‑office whitening.",
    },
    {
      href: "/dental-implants",
      anchorText: "Dental implants in Palo Alto",
      description: "Replace missing teeth with durable implant restorations.",
    },
    {
      href: "/emergency-dental",
      anchorText: "Emergency dental care",
      description: "Same‑day appointments when you need urgent help.",
    },
    {
      href: "/services",
      anchorText: "All cosmetic & family dentistry services",
    },
  ];

  const veneerSchemas = [veneerServiceSchema];

  if (veneerBreadcrumbs) {
    veneerSchemas.push(veneerBreadcrumbs);
  }

  return (
    <>
      <MetaTags 
        title={veneerSeo.title}
        description={veneerSeo.description}
      />
      <StructuredData data={veneerSchemas} />
      <PageBreadcrumbs items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#F5F9FC] to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#333333] mb-6">
              Achieve Your Dream Smile with Dental Veneers
            </h1>
            <p className="text-xl text-[#333333] max-w-4xl mx-auto mb-8">
              Transform your smile with custom dental veneers at Dr. Christopher B. Wong's Palo Alto practice. 
              We offer porcelain, composite, and no-prep veneer options with a conservative, patient-first approach.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/schedule">
                <Button className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3">
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 px-8 py-3">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Are Dental Veneers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold font-heading text-[#333333] mb-6">
                What Are Dental Veneers?
              </h2>
              <p className="text-[#333333] mb-6 text-lg">
                Dental veneers are thin, custom-made shells designed to cover the front surface of your teeth, 
                improving their appearance by changing their color, shape, size, or length. They are a versatile 
                solution for addressing various cosmetic concerns.
              </p>
              <h3 className="text-xl font-semibold text-[#333333] mb-4">Veneers Can Address:</h3>
              <div className="space-y-3">
                {concerns.map((concern, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                    <span className="text-[#333333]">{concern}</span>
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
	                src="/images/veneers.jpg"
	                alt="Beautiful smile transformation with dental veneers"
	                className="w-full h-56 sm:h-72 md:h-96 object-cover rounded-lg shadow-lg"
	              />
              <div className="absolute inset-0 bg-primary/10 rounded-lg"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Types of Veneers */}
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
              Types of Dental Veneers We Offer
            </h2>
            <p className="text-[#333333] max-w-3xl mx-auto">
              Dr. Wong will carefully evaluate your needs and discuss the most suitable veneer option for you. 
              Here are the primary types of veneers we offer at our Palo Alto practice.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            {veneerTypes.map((veneer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white rounded-lg shadow-lg p-8 border-2 ${veneer.color}`}
              >
                <h3 className="text-2xl font-bold font-heading text-[#333333] mb-2">
                  {veneer.title}
                </h3>
                <h4 className="text-lg text-primary font-semibold mb-6">
                  {veneer.subtitle}
                </h4>
                
                <div className="mb-6">
                  <h5 className="font-semibold text-[#333333] mb-3">Key Features:</h5>
                  <div className="space-y-2">
                    {veneer.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <Star className="h-4 w-4 text-primary mt-1 mr-2 flex-shrink-0" />
                        <span className="text-sm text-[#333333]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="font-semibold text-[#333333] mb-2">Process:</h5>
                  <p className="text-sm text-[#333333]">{veneer.process}</p>
                </div>

                {veneer.lifespan && (
                  <div className="mb-6">
                    <h5 className="font-semibold text-[#333333] mb-2">Lifespan:</h5>
                    <p className="text-sm text-[#333333]">{veneer.lifespan}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h5 className="font-semibold text-[#333333] mb-2">Ideal For:</h5>
                  <p className="text-sm text-[#333333]">{veneer.idealFor}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Transformations */}
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
              Veneer patients share their results
            </h2>
            <p className="mt-4 text-sm text-[#4B5563] sm:text-base">
              Real stories from people who chose our team for conservative cosmetic dentistry.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {veneerTestimonials.map((testimonial) => (
              <TestimonialQuote key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Conservative Approach */}
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
	                src="/images/couple.jpg"
	                alt="Happy couple with beautiful smiles after veneer treatment"
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
                Our Conservative, Patient-First Approach
              </h2>
              <p className="text-[#333333] mb-6">
                Dr. Christopher B. Wong is committed to preserving as much of your natural tooth structure as 
                possible while achieving your aesthetic goals. During your consultation at our Palo Alto office, 
                he will conduct a thorough examination and explain the advantages and disadvantages of each option.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Shield className="h-6 w-6 text-primary mt-1 mr-4" />
                  <div>
                    <h4 className="font-semibold text-[#333333] mb-1">Enamel Preservation</h4>
                    <p className="text-[#333333]">We prioritize minimal tooth preparation to preserve your natural enamel.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-primary mt-1 mr-4" />
                  <div>
                    <h4 className="font-semibold text-[#333333] mb-1">Thorough Consultation</h4>
                    <p className="text-[#333333]">Comprehensive evaluation to determine the best veneer option for your needs.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Caring for Veneers */}
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
              Caring for Your Veneers
            </h2>
            <p className="text-[#333333] mb-8">
              Regardless of the type of veneer you choose, maintaining excellent oral hygiene is crucial 
              for their longevity and the health of your underlying teeth.
            </p>
          </motion.div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-[#333333] mb-4">Daily Care:</h3>
                <div className="space-y-3">
                  {careInstructions.map((instruction, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                      <span className="text-[#333333]">{instruction}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#333333] mb-4">Additional Protection:</h3>
                <p className="text-[#333333] mb-4">
                  If you clench or grind your teeth, Dr. Wong may recommend a custom nightguard to protect your veneers 
                  and ensure their longevity.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-[#333333] font-medium">
                    Regular check-ups at our Palo Alto practice help ensure your veneers stay in optimal condition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="Explore more options for your smile in Palo Alto."
      />

      <RelatedServicePosts serviceSlug="dental-veneers" serviceName="Dental Veneers" />

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold font-heading mb-6">
              Ready to Transform Your Smile?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Contact Dr. Christopher B. Wong's Palo Alto dental practice today to schedule your personalized 
              veneer consultation. Discover how dental veneers can give you the confident smile you deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/schedule">
                <Button className="bg-white text-primary hover:bg-gray-100 font-medium px-8 py-3">
                  Schedule Your Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-white border-2 text-white bg-white/10 hover:bg-white/20 px-8 py-3 font-medium">
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

export default DentalVeneers;
