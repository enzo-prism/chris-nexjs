import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import GATestPage from "@/pages/GATestPage";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["ga-test"] },
  });

export default function GATestRoutePage() {
  return (
    <RouteShell ssrPath="/ga-test">
      <GATestPage />
    </RouteShell>
  );
}

