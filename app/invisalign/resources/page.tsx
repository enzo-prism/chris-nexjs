import RouteShell from "../../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../../[...slug]/page";
import InvisalignResources from "@/pages/InvisalignResources";
import { getStorage } from "../../../server/storage/repository";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["invisalign", "resources"] },
  });

export default async function InvisalignResourcesPage() {
  const storage = await getStorage();
  const initialPosts = await storage.getBlogPosts();

  return (
    <RouteShell ssrPath="/invisalign/resources">
      <InvisalignResources initialPosts={initialPosts} />
    </RouteShell>
  );
}
