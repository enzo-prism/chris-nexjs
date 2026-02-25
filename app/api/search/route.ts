import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "../../../server/storage/repository";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("query");
    if (!query) {
      return NextResponse.json(
        { message: "Query parameter is required" },
        { status: 400 },
      );
    }

    const storage = await getStorage();
    const results = await storage.search(query);
    return NextResponse.json(results, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to perform search" },
      { status: 500 },
    );
  }
}
