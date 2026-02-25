import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import DentistRedwoodCity from "@/pages/DentistRedwoodCity";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["dentist-redwood-city"] },
  });

export default function DentistRedwoodCityPage() {
  return (
    <RouteShell ssrPath="/dentist-redwood-city">
      <DentistRedwoodCity />
    </RouteShell>
  );
}

