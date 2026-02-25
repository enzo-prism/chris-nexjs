import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import DentistRedwoodShores from "@/pages/DentistRedwoodShores";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["dentist-redwood-shores"] },
  });

export default function DentistRedwoodShoresPage() {
  return (
    <RouteShell ssrPath="/dentist-redwood-shores">
      <DentistRedwoodShores />
    </RouteShell>
  );
}

