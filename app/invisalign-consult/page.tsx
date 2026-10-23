import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import InvisalignConsult from "@/pages/InvisalignConsult";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["invisalign-consult"] },
  });

export default function InvisalignConsultPage() {
  return (
    <RouteShell ssrPath="/invisalign-consult" chromeVariant="conversion">
      <InvisalignConsult />
    </RouteShell>
  );
}
