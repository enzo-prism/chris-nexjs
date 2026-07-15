import RouteShell from "../../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../../[...slug]/page";
import BlogPost from "@/pages/BlogPost";
import { notFound } from "next/navigation";
import { getStorage } from "../../../server/storage/repository";

export async function generateStaticParams() {
  const storage = await getStorage();
  const posts = await storage.getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return generateCatchallMetadata({
    params: { slug: ["blog", slug] },
  });
}

export default async function BlogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const storage = await getStorage();
  const initialPosts = await storage.getBlogPosts();
  const hasPost = initialPosts.some((post) => post.slug === slug);

  if (!hasPost) {
    notFound();
  }

  return (
    <RouteShell ssrPath={`/blog/${slug}`}>
      <BlogPost params={{ slug }} initialPosts={initialPosts} />
    </RouteShell>
  );
}
