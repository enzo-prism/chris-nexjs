import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import PrivacyPolicy from "@/pages/PrivacyPolicy";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["privacy-policy"] },
  });

export default function PrivacyPolicyPage() {
  return (
    <RouteShell ssrPath="/privacy-policy">
      <PrivacyPolicy />
    </RouteShell>
  );
}

