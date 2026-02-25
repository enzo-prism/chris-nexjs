import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Contact from "@/pages/Contact";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["contact"] },
  });

export default function ContactPage() {
  return (
    <RouteShell ssrPath="/contact">
      <Contact />
    </RouteShell>
  );
}
