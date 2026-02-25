import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Accessibility from "@/pages/Accessibility";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["accessibility"] },
  });

export default function AccessibilityPage() {
  return (
    <RouteShell ssrPath="/accessibility">
      <Accessibility />
    </RouteShell>
  );
}

