import RouteShell from "../../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../../[...slug]/page";
import ZoomWhiteningSchedule from "@/pages/ZoomWhiteningSchedule";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["zoom-whitening", "schedule"] },
  });

export default function ZoomWhiteningSchedulePage() {
  return (
    <RouteShell ssrPath="/zoom-whitening/schedule">
      <ZoomWhiteningSchedule />
    </RouteShell>
  );
}

