"use client";

import AppointmentSection from "@/components/sections/AppointmentSection";
import OfficeVisitSection from "@/components/sections/OfficeVisitSection";
import InsuranceInfoSection from "@/components/sections/InsuranceInfoSection";
import MetaTags from "@/components/common/MetaTags";
import { pageTitles, pageDescriptions } from "@/lib/metaContent";
import { useEffect } from "react";
import HolidayHoursNotice from "@/components/common/HolidayHoursNotice";
import { holidayHours } from "@/lib/data";
import StructuredData from "@/components/seo/StructuredData";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import { buildBreadcrumbSchema, type StructuredDataNode } from "@/lib/structuredData";

const Schedule = () => {
  useEffect(() => {
    // Add the Elfsight script
    const script = document.createElement('script');
    script.src = "https://static.elfsight.com/platform/platform.js";
    script.async = true;
    
    // Add the script to the document if it doesn't already exist
    if (!document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]')) {
      document.body.appendChild(script);
    }
    
    // Cleanup function
    return () => {
      // We're not removing the script on unmount because it might be used by other pages
    };
  }, []);

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Schedule", path: "/schedule" },
  ];
  const breadcrumbSchema: StructuredDataNode | null =
    buildBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <MetaTags 
        title={pageTitles.schedule}
        description={pageDescriptions.schedule}
      />
      {breadcrumbSchema && <StructuredData data={breadcrumbSchema} />}
      <PageBreadcrumbs items={breadcrumbItems} />
      {/* Hero Section */}
      <section className="bg-[#F5F9FC] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#333333] mb-6">Schedule Your Appointment</h1>
            <p className="text-xl text-[#333333] max-w-3xl mx-auto">Book your visit with Dr. Wong's dental practice. We offer flexible scheduling to fit your busy lifestyle.</p>
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
        imageSrc="https://i.imgur.com/iqBXT9y.png"
        imageAlt="Dr. Wong greeting a patient in his Palo Alto office"
        showEmail
      />
      
      {/* Google Reviews Section */}
      <section className="py-16 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#333333] mb-4">Why Our Patients Love Us</h2>
            <p className="text-[#333333] max-w-3xl mx-auto">See what our patients are saying about their experience with Dr. Wong.</p>
            <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden p-4">
            {/* Elfsight Google Reviews Widget */}
            <div className="elfsight-app-97536d24-590e-4a39-ae4c-c3fb469042f8" data-elfsight-app-lazy></div>
          </div>
        </div>
      </section>

      <InsuranceInfoSection />
    </>
  );
};

export default Schedule;
