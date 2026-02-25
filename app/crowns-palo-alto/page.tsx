import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import CrownsPaloAlto from "@/pages/CrownsPaloAlto";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["crowns-palo-alto"] },
  });

export default function CrownsPaloAltoPage() {
  return (
    <RouteShell ssrPath="/crowns-palo-alto">
      <CrownsPaloAlto />
    </RouteShell>
  );
}

