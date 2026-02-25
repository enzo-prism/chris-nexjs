import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Invisalign from "@/pages/Invisalign";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["invisalign"] },
  });

export default function InvisalignPage() {
  return (
    <RouteShell ssrPath="/invisalign">
      <Invisalign />
    </RouteShell>
  );
}
