import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Blog from "@/pages/Blog";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["blog"] },
  });

export default function BlogPage() {
  return (
    <RouteShell ssrPath="/blog">
      <Blog />
    </RouteShell>
  );
}
