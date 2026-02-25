import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../_utils/response";
import { getStorage } from "../../../server/storage/repository";

export async function GET() {
  try {
    const storage = await getStorage();
    const services = await storage.getServices();
    return jsonOk(services, 200);
  } catch (error) {
    return jsonError(500, "Failed to fetch services");
  }
}
