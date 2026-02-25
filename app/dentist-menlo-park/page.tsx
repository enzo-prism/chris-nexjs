import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import DentistMenloPark from "@/pages/DentistMenloPark";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["dentist-menlo-park"] },
  });

export default function DentistMenloParkPage() {
  return (
    <RouteShell ssrPath="/dentist-menlo-park">
      <DentistMenloPark />
    </RouteShell>
  );
}
