import RouteShell from "../../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../../[...slug]/page";
import BlogPost from "@/pages/BlogPost";
import { notFound } from "next/navigation";
import { getStorage } from "../../../server/storage/repository";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return generateCatchallMetadata({
    params: { slug: ["blog", params.slug] },
  });
}

export default async function BlogSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const storage = await getStorage();
  const initialPosts = await storage.getBlogPosts();
  const hasPost = initialPosts.some((post) => post.slug === params.slug);

  if (!hasPost) {
    notFound();
  }

  return (
    <RouteShell ssrPath={`/blog/${params.slug}`}>
      <BlogPost params={{ slug: params.slug }} initialPosts={initialPosts} />
    </RouteShell>
  );
}
