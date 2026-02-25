import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import EmergencyDental from "@/pages/EmergencyDental";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["emergency-dental"] },
  });

export default function EmergencyDentalPage() {
  return (
    <RouteShell ssrPath="/emergency-dental">
      <EmergencyDental />
    </RouteShell>
  );
}

