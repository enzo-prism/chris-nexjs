"use client";

import ScheduleRequestFunnel from "@/components/sections/ScheduleRequestFunnel";
import StructuredData from "@/components/seo/StructuredData";
import {
  buildBreadcrumbSchema,
  type StructuredDataNode,
} from "@/lib/structuredData";

// Title/description come from shared/seo.ts via the route's generateMetadata.
const Schedule = () => {
  const breadcrumbSchema: StructuredDataNode | null = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Schedule", path: "/schedule" },
  ]);

  return (
    <>
      {breadcrumbSchema ? <StructuredData data={breadcrumbSchema} /> : null}
      <ScheduleRequestFunnel />
    </>
  );
};

export default Schedule;
