import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import DentistStanford from "@/pages/DentistStanford";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["dentist-stanford"] },
  });

export default function DentistStanfordPage() {
  return (
    <RouteShell ssrPath="/dentist-stanford">
      <DentistStanford />
    </RouteShell>
  );
}

