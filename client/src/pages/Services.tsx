import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import ButtonLink from "@/components/common/ButtonLink";
import { Link } from "wouter";
import ServiceCard from "@/components/common/ServiceCard";
import MetaTags from "@/components/common/MetaTags";
import { pageTitles, pageDescriptions } from "@/lib/metaContent";
import { Service } from "@shared/schema";
import OptimizedImage from "@/components/seo/OptimizedImage";
import StructuredData from "@/components/seo/StructuredData";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import FAQSection from "@/components/common/FAQSection";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildItemListSchema,  type FAQEntry,
} from "@/lib/structuredData";

const preventiveDentistryFaqs: FAQEntry[] = [
  {
    question: "How often should I schedule preventive visits?",
    answer:
      "Most patients benefit from exams and cleanings every six months. If you’re managing gum disease, wear down teeth from grinding, or have frequent cavities, we may recommend visits every 3–4 months for added protection.",
  },
  {
    question: "What’s included in a preventive dentistry appointment?",
    answer:
      "A typical visit includes a professional cleaning, a detailed exam, gum health screening, and digital X‑rays when needed. We look for early signs of decay, infection, or bite issues so problems can be treated before they become painful.",
  },
  {
    question: "Are dental X‑rays safe?",
    answer:
      "Yes. We use modern digital imaging, which reduces radiation exposure significantly compared to older film systems. We only take X‑rays at intervals that match your age, history, and risk level.",
  },
  {
    question: "Can preventive care really stop cavities and gum disease?",
    answer:
      "Preventive care can’t eliminate risk entirely, but it greatly lowers it. Regular cleanings remove hardened tartar that brushing can’t, and exams catch problems early when treatment is simpler and more affordable.",
  },
  {
    question: "What if I haven’t been to the dentist in a while?",
    answer:
      "You’re not alone. We’ll start with a comfortable, judgment‑free exam and a plan that prioritizes your needs. Even after a long gap, preventive care is the best first step to get back on track.",
  },
];

const Services = () => {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const servicesSchemas = [
  ];

  const itemListSchema =
    services && services.length ? buildItemListSchema(services) : null;
  if (itemListSchema) {
    servicesSchemas.push(itemListSchema);
  }

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ];
  const serviceBreadcrumbs = buildBreadcrumbSchema(breadcrumbItems);

  if (serviceBreadcrumbs) {
    servicesSchemas.push(serviceBreadcrumbs);
  }

  const preventiveFaqSchema = buildFAQSchema(preventiveDentistryFaqs, "/services");
  if (preventiveFaqSchema) {
    servicesSchemas.push(preventiveFaqSchema);
  }

  const localServiceLinks = [
    {
      href: "/dental-cleaning-palo-alto",
      title: "Dental cleaning in Palo Alto",
      description: "Preventive visits designed to keep gums healthy and cavities away.",
    },
    {
      href: "/teeth-whitening-palo-alto",
      title: "Teeth whitening in Palo Alto",
      description: "In-office and take-home options with dentist supervision.",
    },
    {
      href: "/cavity-fillings-palo-alto",
      title: "Cavity fillings in Palo Alto",
      description: "Tooth-colored restorations that look natural and feel comfortable.",
    },
    {
      href: "/crowns-palo-alto",
      title: "Dental crowns in Palo Alto",
      description: "Custom protection for cracked or heavily restored teeth.",
    },
    {
      href: "/pediatric-dentist-palo-alto",
      title: "Pediatric dentist in Palo Alto",
      description: "Gentle care for kids and teens in a family-friendly setting.",
    },
    {
      href: "/dentist-menlo-park",
      title: "Menlo Park family dentist",
      description: "Convenient care nearby in our Palo Alto office.",
    },
    {
      href: "/dentist-mountain-view",
      title: "Mountain View family dentist",
      description: "Comprehensive care close to Mountain View families.",
    },
    {
      href: "/dentist-los-altos",
      title: "Los Altos dentist",
      description: "Personalized dental care just minutes away in Palo Alto.",
    },
    {
      href: "/dentist-los-altos-hills",
      title: "Los Altos Hills dentist",
      description: "Personalized care for families near Los Altos Hills.",
    },
    {
      href: "/dentist-sunnyvale",
      title: "Sunnyvale family dentist",
      description: "Family-friendly care close to Sunnyvale patients.",
    },
    {
      href: "/dentist-cupertino",
      title: "Cupertino family dentist",
      description: "Comprehensive care near Cupertino families.",
    },
    {
      href: "/dentist-redwood-city",
      title: "Redwood City dentist",
      description: "Conservative care for patients across the Peninsula.",
    },
    {
      href: "/dentist-atherton",
      title: "Atherton dentist",
      description: "Modern care for Atherton families near Palo Alto.",
    },
    {
      href: "/dentist-redwood-shores",
      title: "Redwood Shores dentist",
      description: "Family-friendly care for Redwood Shores patients.",
    },
    {
      href: "/locations",
      title: "All locations",
      description: "Explore every Peninsula community we serve.",
    },
  ];

  return (
    <>
      <MetaTags 
        title={pageTitles.services}
        description={pageDescriptions.services}
      />
      <StructuredData data={servicesSchemas} />
      <PageBreadcrumbs items={breadcrumbItems} />
      {/* Services List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-[#333333] mb-4">
              Comprehensive Dental Services in Palo Alto, CA
            </h1>
            <p className="text-[#333333] max-w-3xl mx-auto">
              From routine cleanings to complex restorations, we provide a full range of dental services for
              patients in Palo Alto and nearby communities like Menlo Park and Stanford.
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md h-64 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services?.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#333333] mb-3">
              Popular Palo Alto Dental Services
            </h2>
            <p className="text-[#333333] max-w-3xl mx-auto">
              Explore the most requested treatments in our Palo Alto office and learn more about care for
              nearby neighborhoods and families.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {localServiceLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className="group h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                    {link.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{link.description}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FAQSection
        title="Preventive dentistry FAQs"
        subtitle="Quick answers about checkups, cleanings, and keeping your smile healthy."
        items={preventiveDentistryFaqs}
        className="bg-white py-16"
      />

      {/* Insurance Section */}
      <section className="py-16 bg-[#F5F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold font-heading text-[#333333] mb-4">Insurance & Payment Options</h2>
              <p className="text-[#333333] mb-4">We accept most major PPO dental insurance plans and offer flexible payment options to make dental care accessible.</p>
              <p className="text-[#333333] mb-6">Our team will help you understand your coverage and maximize your benefits. For patients without insurance, we offer an in-house dental plan.</p>
              
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-xl font-bold font-heading text-[#333333] mb-3">Accepted Insurance:</h3>
                <p className="text-[#333333] mb-3">We are in-network with most major PPO dental insurance plans only.</p>
                <p className="text-[#333333]">Please contact our office to verify your specific plan's coverage before your appointment.</p>
              </div>
              
              <ButtonLink
                href="/patient-resources#insurance"
                className="rounded-md bg-primary px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Learn More About Insurance
              </ButtonLink>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <OptimizedImage
                src="https://imgur.com/hO02YQ0.jpg"
                alt="Payment processing with mobile device"
                className="w-full aspect-[4/3] object-cover rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-6">Ready to Schedule Your Appointment?</h2>
          <p className="text-white text-xl mb-8 max-w-3xl mx-auto">Contact us today to book your visit and take the first step toward optimal dental health.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <ButtonLink
              href="/schedule#appointment"
              className="rounded-md bg-white px-8 py-3 font-semibold text-primary hover:bg-gray-100"
            >
              Schedule Appointment
            </ButtonLink>
            <ButtonLink
              href="/contact"
              variant="outline"
              className="rounded-md border-2 border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10"
            >
              Contact Us
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
