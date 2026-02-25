import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import DentistCupertino from "@/pages/DentistCupertino";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["dentist-cupertino"] },
  });

export default function DentistCupertinoPage() {
  return (
    <RouteShell ssrPath="/dentist-cupertino">
      <DentistCupertino />
    </RouteShell>
  );
}

