import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import PreventiveDentistry from "@/pages/PreventiveDentistry";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["preventive-dentistry"] },
  });

export default function PreventiveDentistryPage() {
  return (
    <RouteShell ssrPath="/preventive-dentistry">
      <PreventiveDentistry />
    </RouteShell>
  );
}

