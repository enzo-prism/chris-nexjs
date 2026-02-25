import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import DentistMountainView from "@/pages/DentistMountainView";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["dentist-mountain-view"] },
  });

export default function DentistMountainViewPage() {
  return (
    <RouteShell ssrPath="/dentist-mountain-view">
      <DentistMountainView />
    </RouteShell>
  );
}

