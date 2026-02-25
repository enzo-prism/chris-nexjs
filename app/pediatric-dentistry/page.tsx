import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import PediatricDentistry from "@/pages/PediatricDentistry";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["pediatric-dentistry"] },
  });

export default function PediatricDentistryPage() {
  return (
    <RouteShell ssrPath="/pediatric-dentistry">
      <PediatricDentistry />
    </RouteShell>
  );
}

