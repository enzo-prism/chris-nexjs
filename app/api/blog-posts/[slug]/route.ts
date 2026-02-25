import { NextResponse } from "next/server";
import { getStorage } from "../../../../server/storage/repository";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const storage = await getStorage();
    const blogPost = await storage.getBlogPostBySlug(params.slug);

    if (!blogPost) {
      return NextResponse.json(
        { message: "Blog post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(blogPost, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch blog post" },
      { status: 500 },
    );
  }
}
