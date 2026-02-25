import { NextResponse } from "next/server";
import { jsonError } from "../_utils/response";
import { getStorage } from "../../../server/storage/repository";

export async function GET() {
  try {
    const storage = await getStorage();
    const services = await storage.getServices();
    return NextResponse.json(services, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    return jsonError(500, "Failed to fetch services");
  }
}
