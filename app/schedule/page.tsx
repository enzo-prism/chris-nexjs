import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Schedule from "@/pages/Schedule";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["schedule"] },
  });

export default function SchedulePage() {
  return (
    <RouteShell ssrPath="/schedule">
      <Schedule />
    </RouteShell>
  );
}
