import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import TeethWhiteningPaloAlto from "@/pages/TeethWhiteningPaloAlto";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["teeth-whitening-palo-alto"] },
  });

export default function TeethWhiteningPaloAltoPage() {
  return (
    <RouteShell ssrPath="/teeth-whitening-palo-alto">
      <TeethWhiteningPaloAlto />
    </RouteShell>
  );
}

