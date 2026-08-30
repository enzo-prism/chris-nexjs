import { NextResponse } from "next/server";
import { getPublishedTestimonials } from "../../../server/storage/publishedTestimonials";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testimonials = await getPublishedTestimonials();
    return NextResponse.json(testimonials, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch testimonials" },
      { status: 500 },
    );
  }
}
