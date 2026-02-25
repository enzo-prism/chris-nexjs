import RouteShell from "../../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../../[...slug]/page";
import InvisalignResources from "@/pages/InvisalignResources";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["invisalign", "resources"] },
  });

export default function InvisalignResourcesPage() {
  return (
    <RouteShell ssrPath="/invisalign/resources">
      <InvisalignResources />
    </RouteShell>
  );
}

