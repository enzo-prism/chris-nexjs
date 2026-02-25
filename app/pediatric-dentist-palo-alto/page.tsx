import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import PediatricDentistPaloAlto from "@/pages/PediatricDentistPaloAlto";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["pediatric-dentist-palo-alto"] },
  });

export default function PediatricDentistPaloAltoPage() {
  return (
    <RouteShell ssrPath="/pediatric-dentist-palo-alto">
      <PediatricDentistPaloAlto />
    </RouteShell>
  );
}

