import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Analytics from "@/pages/Analytics";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["analytics"] },
  });

export default function AnalyticsPage() {
  return (
    <RouteShell ssrPath="/analytics">
      <Analytics />
    </RouteShell>
  );
}

