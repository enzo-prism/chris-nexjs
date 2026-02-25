import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import DentistLosAltosHills from "@/pages/DentistLosAltosHills";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["dentist-los-altos-hills"] },
  });

export default function DentistLosAltosHillsPage() {
  return (
    <RouteShell ssrPath="/dentist-los-altos-hills">
      <DentistLosAltosHills />
    </RouteShell>
  );
}

