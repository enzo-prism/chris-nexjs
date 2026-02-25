import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import CavityFillingsPaloAlto from "@/pages/CavityFillingsPaloAlto";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["cavity-fillings-palo-alto"] },
  });

export default function CavityFillingsPaloAltoPage() {
  return (
    <RouteShell ssrPath="/cavity-fillings-palo-alto">
      <CavityFillingsPaloAlto />
    </RouteShell>
  );
}

