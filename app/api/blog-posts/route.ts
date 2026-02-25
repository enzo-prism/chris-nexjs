import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "../../../server/storage/repository";

export async function GET(request: NextRequest) {
  try {
    const storage = await getStorage();
    const serviceFilter =
      typeof request.nextUrl.searchParams.get("service") === "string"
        ? request.nextUrl.searchParams.get("service")
        : undefined;
    const blogPosts = serviceFilter
      ? await storage.getBlogPostsByServiceSlug(serviceFilter)
      : await storage.getBlogPosts();

    return NextResponse.json(blogPosts, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch blog posts" },
      { status: 500 },
    );
  }
}
