import { ArrowRight } from "lucide-react";
import AppointmentSection from "@/components/sections/AppointmentSection";
import OfficeVisitSection from "@/components/sections/OfficeVisitSection";
import InsuranceInfoSection from "@/components/sections/InsuranceInfoSection";
import MetaTags from "@/components/common/MetaTags";
import { pageTitles, pageDescriptions } from "@/lib/metaContent";
import HolidayHoursNotice from "@/components/common/HolidayHoursNotice";
import StructuredData from "@/components/seo/StructuredData";
import { holidayHours, officeInfo } from "@/lib/data";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import { Link } from "wouter";
import {
  buildBreadcrumbSchema,
  type StructuredDataNode,
  absoluteUrl,
} from "@/lib/structuredData";

const Contact = () => {
  const contactPageSchema: StructuredDataNode = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl("/contact")}#webpage`,
    name: "Contact Our Palo Alto Dental Office",
    url: absoluteUrl("/contact"),
    description: pageDescriptions.contact,
    about: {
      "@id": `${absoluteUrl("/")}#organization`,
    },
  };
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ];
  const contactBreadcrumbs = buildBreadcrumbSchema(breadcrumbItems);
  const contactSchemas: StructuredDataNode[] = [contactPageSchema];
  if (contactBreadcrumbs) {
    contactSchemas.push(contactBreadcrumbs);
  }

  return (
    <>
      <MetaTags 
        title={pageTitles.contact}
        description={pageDescriptions.contact}
      />
      <StructuredData data={contactSchemas} />
      <PageBreadcrumbs items={breadcrumbItems} />
      {/* Hero Section */}
      <section className="bg-[#F5F9FC] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#333333] mb-6">
              Contact Our Palo Alto Dental Office
            </h1>
            <p className="text-xl text-[#333333] max-w-3xl mx-auto">
              Schedule your visit with Dr. Wong’s dental practice at {officeInfo.address.line1},{" "}
              {officeInfo.address.city}, {officeInfo.address.region} {officeInfo.address.postalCode}.
              We offer flexible appointment times for new and returning patients.
            </p>
          </div>
        </div>
      </section>

      {holidayHours.active && (
        <section className="bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <HolidayHoursNotice variant="card" />
          </div>
        </section>
      )}

      {/* Appointment Section - Moved to top and given an ID for direct navigation */}
      <section id="appointment">
        <AppointmentSection />
      </section>

      <OfficeVisitSection
        imageSrc="https://i.imgur.com/rIGaK9S.png"
        imageAlt="Reception desk at Dr. Wong's Palo Alto dental office"
        showDirectionsButton
        withSchema
        schemaUrl="https://www.chriswongdds.com/contact"
        schemaName="Christopher B. Wong, DDS"
        schemaImage="https://www.chriswongdds.com/images/dr_wong_polaroids.png"
      />

      <section className="py-12 bg-[#F5F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#333333] mb-3">
              Serving Palo Alto and Nearby Peninsula Communities
            </h2>
            <p className="text-[#333333] max-w-3xl mx-auto">
              Our Palo Alto dental office welcomes patients from surrounding neighborhoods and cities. Find
              the right visit for your location and care goals below.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/dentist-menlo-park", label: "Menlo Park family dentist" },
              { href: "/dentist-stanford", label: "Stanford dentist" },
              { href: "/dentist-mountain-view", label: "Mountain View family dentist" },
              { href: "/dentist-los-altos", label: "Los Altos dentist" },
              { href: "/dentist-los-altos-hills", label: "Los Altos Hills dentist" },
              { href: "/dentist-sunnyvale", label: "Sunnyvale family dentist" },
              { href: "/dentist-cupertino", label: "Cupertino family dentist" },
              { href: "/dentist-redwood-city", label: "Redwood City dentist" },
              { href: "/dentist-atherton", label: "Atherton dentist" },
              { href: "/dentist-redwood-shores", label: "Redwood Shores dentist" },
              { href: "/locations", label: "All locations" },
              { href: "/dental-cleaning-palo-alto", label: "Dental cleanings in Palo Alto" },
              { href: "/pediatric-dentist-palo-alto", label: "Pediatric dentist in Palo Alto" },
              { href: "/teeth-whitening-palo-alto", label: "Teeth whitening in Palo Alto" },
              { href: "/emergency-dental", label: "Emergency dentist in Palo Alto" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                    {item.label}
                  </h3>
                  <span className="mt-3 inline-flex items-center text-sm font-semibold text-primary">
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <InsuranceInfoSection />
    </>
  );
};

export default Contact;
