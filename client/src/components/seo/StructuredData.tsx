import type { StructuredDataNode } from "@/lib/structuredData";

interface StructuredDataProps {
  data: StructuredDataNode | StructuredDataNode[];
  id?: string;
}

const StructuredData = ({ data, id }: StructuredDataProps) => {
  if (!data) return null;
  const entries = Array.isArray(data) ? data : [data];
  if (!entries.length) return null;
  const jsonLd = JSON.stringify(entries.length === 1 ? entries[0] : entries);

  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
};

export default StructuredData;
