import { NextResponse } from "next/server";
import { getStorage } from "../../../server/storage/repository";

export async function GET() {
  try {
    const storage = await getStorage();
    const testimonials = await storage.getTestimonials();
    return NextResponse.json(testimonials, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch testimonials" },
      { status: 500 },
    );
  }
}
