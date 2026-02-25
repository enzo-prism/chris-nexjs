import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import DentistSunnyvale from "@/pages/DentistSunnyvale";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["dentist-sunnyvale"] },
  });

export default function DentistSunnyvalePage() {
  return (
    <RouteShell ssrPath="/dentist-sunnyvale">
      <DentistSunnyvale />
    </RouteShell>
  );
}

