import RouteShell from "../../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../../[...slug]/page";
import BlogPost from "@/pages/BlogPost";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return generateCatchallMetadata({
    params: { slug: ["blog", params.slug] },
  });
}

export default function BlogSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <RouteShell ssrPath={`/blog/${params.slug}`}>
      <BlogPost params={{ slug: params.slug }} />
    </RouteShell>
  );
}
