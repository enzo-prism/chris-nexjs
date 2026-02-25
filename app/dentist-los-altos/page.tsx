import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import DentistLosAltos from "@/pages/DentistLosAltos";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["dentist-los-altos"] },
  });

export default function DentistLosAltosPage() {
  return (
    <RouteShell ssrPath="/dentist-los-altos">
      <DentistLosAltos />
    </RouteShell>
  );
}

