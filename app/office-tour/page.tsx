import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import OfficeTour from "@/pages/OfficeTour";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["office-tour"] },
  });

export default function OfficeTourPage() {
  return (
    <RouteShell ssrPath="/office-tour">
      <OfficeTour />
    </RouteShell>
  );
}
