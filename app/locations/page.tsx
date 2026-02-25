import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Locations from "@/pages/Locations";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["locations"] },
  });

export default function LocationsPage() {
  return (
    <RouteShell ssrPath="/locations">
      <Locations />
    </RouteShell>
  );
}

