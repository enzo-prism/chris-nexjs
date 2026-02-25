import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import DentalCleaningPaloAlto from "@/pages/DentalCleaningPaloAlto";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["dental-cleaning-palo-alto"] },
  });

export default function DentalCleaningPaloAltoPage() {
  return (
    <RouteShell ssrPath="/dental-cleaning-palo-alto">
      <DentalCleaningPaloAlto />
    </RouteShell>
  );
}

