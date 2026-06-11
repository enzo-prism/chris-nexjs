import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Insurance from "@/pages/Insurance";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["insurance"] },
  });

export default function InsurancePage() {
  return (
    <RouteShell ssrPath="/insurance">
      <Insurance />
    </RouteShell>
  );
}
