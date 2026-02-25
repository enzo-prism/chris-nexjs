import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import About from "@/pages/About";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["about"] },
  });

export default function AboutPage() {
  return (
    <RouteShell
      ssrPath="/about"
      enableQueryClient={false}
      enableHelmet={false}
    >
      <About />
    </RouteShell>
  );
}
