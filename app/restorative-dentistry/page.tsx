import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import RestorativeDentistry from "@/pages/RestorativeDentistry";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["restorative-dentistry"] },
  });

export default function RestorativeDentistryPage() {
  return (
    <RouteShell ssrPath="/restorative-dentistry">
      <RestorativeDentistry />
    </RouteShell>
  );
}

