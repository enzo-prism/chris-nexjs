import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import DentalImplants from "@/pages/DentalImplants";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["dental-implants"] },
  });

export default function DentalImplantsPage() {
  return (
    <RouteShell ssrPath="/dental-implants">
      <DentalImplants />
    </RouteShell>
  );
}

