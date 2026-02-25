import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import ThankYou from "@/pages/ThankYou";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["thank-you"] },
  });

export default function ThankYouPage() {
  return (
    <RouteShell ssrPath="/thank-you">
      <ThankYou />
    </RouteShell>
  );
}

