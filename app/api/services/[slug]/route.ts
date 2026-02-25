import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getStorage } from "../../../../server/storage/repository";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const storage = await getStorage();
    const service = await storage.getServiceBySlug(params.slug);

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Failed to fetch service" }, { status: 500 });
  }
}
