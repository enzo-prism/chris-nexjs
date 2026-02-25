import MetaTags from "@/components/common/MetaTags";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { officeInfo } from "@/lib/data";
import { getSeoForPath } from "@/lib/seo";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";
import { buildBreadcrumbSchema, buildFAQSchema, type StructuredDataNode } from "@/lib/structuredData";

const Locations = () => {
  const seo = getSeoForPath("/locations");

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Locations", path: "/locations" },
  ];

  const faqs = [
    {
      question: "Do you accept patients from outside Palo Alto?",
      answer:
        "Yes. We welcome patients from across the Peninsula and regularly see families from Menlo Park, Stanford, Mountain View, Los Altos, Sunnyvale, and nearby communities.",
    },
    {
      question: "How do I choose the right location page?",
      answer:
        "Choose the city closest to you to see service highlights and local FAQs. All care takes place at our Palo Alto office.",
    },
    {
      question: "Do you offer the same services for all nearby cities?",
      answer:
        "Yes. Our Palo Alto office provides preventive care, restorative dentistry, Invisalign, cosmetic treatments, and emergency care for all nearby communities.",
    },
  ];

  const structuredDataNodes: StructuredDataNode[] = [];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const faqSchema = buildFAQSchema(faqs, "/locations");
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);
  if (faqSchema) structuredDataNodes.push(faqSchema);

  const locations = [
    {
      href: "/",
      title: "Palo Alto (Primary Office)",
      description: "Visit our main Palo Alto dental office for comprehensive care.",
    },
    {
      href: "/dentist-menlo-park",
      title: "Menlo Park",
      description: "Family dentistry near Menlo Park with convenient Palo Alto access.",
    },
    {
      href: "/dentist-stanford",
      title: "Stanford",
      description: "Flexible care for students, faculty, and families near campus.",
    },
    {
      href: "/dentist-mountain-view",
      title: "Mountain View",
      description: "Preventive, restorative, and Invisalign care for Mountain View families.",
    },
    {
      href: "/dentist-los-altos",
      title: "Los Altos",
      description: "Personalized care for Los Altos patients at our nearby Palo Alto office.",
    },
    {
      href: "/dentist-los-altos-hills",
      title: "Los Altos Hills",
      description: "Conservative dental care for Los Altos Hills families.",
    },
    {
      href: "/dentist-sunnyvale",
      title: "Sunnyvale",
      description: "Family-friendly dental care close to Sunnyvale patients.",
    },
    {
      href: "/dentist-cupertino",
      title: "Cupertino",
      description: "Comprehensive dental care for Cupertino families.",
    },
    {
      href: "/dentist-redwood-city",
      title: "Redwood City",
      description: "Conservative care for Redwood City patients near Palo Alto.",
    },
    {
      href: "/dentist-redwood-shores",
      title: "Redwood Shores",
      description: "Preventive and cosmetic care for Redwood Shores patients.",
    },
    {
      href: "/dentist-atherton",
      title: "Atherton",
      description: "Modern dentistry for Atherton families near Palo Alto.",
    },
  ];

  return (
    <>
      <MetaTags title={seo.title} description={seo.description} />
      {structuredDataNodes.length > 0 && <StructuredData data={structuredDataNodes} />}
      <PageBreadcrumbs items={breadcrumbItems} />

      <section className="bg-[#F5F9FC] py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#1F2933]">Locations We Serve</h1>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto">
            Our Palo Alto dental office welcomes patients from across the Peninsula. Use the links below to find
            location-specific FAQs, service highlights, and planning tips for your community.
          </p>
          <div className="inline-flex items-center gap-2 text-slate-700">
            <MapPin className="h-5 w-5 text-primary" />
            <span>
              {officeInfo.address.line1}, {officeInfo.address.city}, {officeInfo.address.region} {officeInfo.address.postalCode}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/schedule#appointment">
              <Button className="bg-primary text-white hover:bg-primary/90">Request an appointment</Button>
            </Link>
            <a href={`tel:${officeInfo.phoneE164}`}>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                Call {officeInfo.phone}
                <Phone className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
              <Link key={location.href} href={location.href}>
                <div className="group h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                    {location.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">{location.description}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                    View details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#F5F9FC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading text-[#1F2933] mb-6">Locations FAQs</h2>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
                <p className="mt-2 text-slate-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Locations;
