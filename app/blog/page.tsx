import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Blog from "@/pages/Blog";
import { getStorage } from "../../server/storage/repository";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["blog"] },
  });

export default async function BlogPage() {
  const storage = await getStorage();
  const initialPosts = await storage.getBlogPosts();

  return (
    <RouteShell ssrPath="/blog">
      <Blog initialPosts={initialPosts} />
    </RouteShell>
  );
}
