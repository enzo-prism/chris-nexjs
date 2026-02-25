import { Helmet } from "@/lib/helmet";
import type { StructuredDataNode } from "@/lib/structuredData";

interface StructuredDataProps {
  data: StructuredDataNode | StructuredDataNode[];
  id?: string;
}

const StructuredData = ({ data, id }: StructuredDataProps) => {
  if (!data) return null;
  const entries = Array.isArray(data) ? data : [data];
  if (!entries.length) return null;

  return (
    <Helmet>
      <script type="application/ld+json" id={id}>
        {JSON.stringify(entries.length === 1 ? entries[0] : entries)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
