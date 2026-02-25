import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import PatientResources from "@/pages/PatientResources";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["patient-resources"] },
  });

export default function PatientResourcesPage() {
  return (
    <RouteShell ssrPath="/patient-resources">
      <PatientResources />
    </RouteShell>
  );
}

