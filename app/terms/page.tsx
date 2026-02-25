import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import TermsOfService from "@/pages/TermsOfService";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["terms"] },
  });

export default function TermsPage() {
  return (
    <RouteShell ssrPath="/terms">
      <TermsOfService />
    </RouteShell>
  );
}

