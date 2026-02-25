import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import HipaaNotice from "@/pages/HipaaNotice";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["hipaa"] },
  });

export default function HipaaPage() {
  return (
    <RouteShell ssrPath="/hipaa">
      <HipaaNotice />
    </RouteShell>
  );
}

