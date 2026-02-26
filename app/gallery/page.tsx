import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Gallery from "@/pages/Gallery";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["gallery"] },
  });

export default function GalleryPage() {
  return (
    <RouteShell ssrPath="/gallery">
      <Gallery />
    </RouteShell>
  );
}
