"use client";

import ScheduleRequestFunnel from "@/components/sections/ScheduleRequestFunnel";
import MetaTags from "@/components/common/MetaTags";
import { pageTitles, pageDescriptions } from "@/lib/metaContent";
import StructuredData from "@/components/seo/StructuredData";
import {
  buildBreadcrumbSchema,
  type StructuredDataNode,
} from "@/lib/structuredData";

const Schedule = () => {
  const breadcrumbSchema: StructuredDataNode | null = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Schedule", path: "/schedule" },
  ]);

  return (
    <>
      <MetaTags title={pageTitles.schedule} description={pageDescriptions.schedule} />
      {breadcrumbSchema ? <StructuredData data={breadcrumbSchema} /> : null}
      <ScheduleRequestFunnel />
    </>
  );
};

export default Schedule;
