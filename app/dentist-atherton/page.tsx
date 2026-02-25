import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import DentistAtherton from "@/pages/DentistAtherton";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["dentist-atherton"] },
  });

export default function DentistAthertonPage() {
  return (
    <RouteShell ssrPath="/dentist-atherton">
      <DentistAtherton />
    </RouteShell>
  );
}

