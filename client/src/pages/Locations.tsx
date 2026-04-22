"use client";

import MetaTags from "@/components/common/MetaTags";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import OptimizedImage from "@/components/seo/OptimizedImage";
import StructuredData from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { officeInfo } from "@/lib/data";
import { getSeoForPath } from "@/lib/seo";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildFAQSchema,
  buildLocationItemListSchema,
  type StructuredDataNode,
} from "@/lib/structuredData";

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

  const locationParts = locations.map((location) => ({
    name: location.title,
    path: location.href,
    description: location.description,
  }));
  const locationListSchema = buildLocationItemListSchema(locationParts);
  if (locationListSchema) {
    structuredDataNodes.push(locationListSchema);
  }
  const locationCollectionSchema = buildCollectionPageSchema({
    path: "/locations",
    name: "Peninsula locations served by Christopher B. Wong, DDS",
    description:
      "Location hub for Palo Alto and nearby Peninsula communities served by our dental office.",
    parts: locationParts,
  });
  if (locationCollectionSchema) {
    structuredDataNodes.push(locationCollectionSchema);
  }

  return (
    <>
      <MetaTags title={seo.title} description={seo.description} />
      {structuredDataNodes.length > 0 && <StructuredData data={structuredDataNodes} />}
      <PageBreadcrumbs items={breadcrumbItems} />

      <section className="bg-[#F5F9FC] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Serving Palo Alto and nearby communities
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#1F2933]">Locations We Serve</h1>
              <p className="text-lg text-slate-700 max-w-3xl mx-auto lg:mx-0">
                Our Palo Alto dental office welcomes patients from across the Peninsula. Use the links below to find
                location-specific FAQs, service highlights, and planning tips for your community.
              </p>
              <div className="inline-flex items-center gap-2 text-slate-700">
                <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                <span>
                  {officeInfo.address.line1}, {officeInfo.address.city}, {officeInfo.address.region}{" "}
                  {officeInfo.address.postalCode}
                </span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/schedule#appointment">
                  <Button className="ui-btn-primary">Request an appointment</Button>
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
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <OptimizedImage
                  src="/images/palo-alto-community-serving.png"
                  alt="Illustrated scene of a Palo Alto dental team welcoming local families and nearby communities"
                  width={1536}
                  height={1024}
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  quality={72}
                  className="aspect-[3/2] w-full"
                  objectPosition="50% 50%"
                />
              </div>
            </div>
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
