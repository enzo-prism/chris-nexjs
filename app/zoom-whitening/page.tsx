import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import ZoomWhitening from "@/pages/ZoomWhitening";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["zoom-whitening"] },
  });

export default function ZoomWhiteningPage() {
  return (
    <RouteShell ssrPath="/zoom-whitening">
      <ZoomWhitening />
    </RouteShell>
  );
}

