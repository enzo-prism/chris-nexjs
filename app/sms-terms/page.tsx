import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import SmsTerms from "@/pages/SmsTerms";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["sms-terms"] },
  });

export default function SmsTermsPage() {
  return (
    <RouteShell ssrPath="/sms-terms">
      <SmsTerms />
    </RouteShell>
  );
}
