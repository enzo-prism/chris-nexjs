import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import PatientStories from "@/pages/PatientStories";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["patient-stories"] },
  });

export default function PatientStoriesPage() {
  return (
    <RouteShell ssrPath="/patient-stories">
      <PatientStories />
    </RouteShell>
  );
}

