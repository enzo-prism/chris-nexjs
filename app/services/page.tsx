import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Services from "@/pages/Services";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["services"] },
  });

export default function ServicesPage() {
  return (
    <RouteShell ssrPath="/services">
      <Services />
    </RouteShell>
  );
}
