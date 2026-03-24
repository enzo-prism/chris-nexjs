import { NextRequest, NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { getAnalyticsPathFromUrl } from "@shared/analytics";
import { insertContactMessageSchema } from "@shared/schema";
import { getStorage } from "../../../server/storage/repository";
import { trackVercelServerEvent } from "../../../server/vercelAnalytics";
import { z } from "zod";

const contactPayloadSchema = insertContactMessageSchema.extend({
  fullName: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  subject: z.string().trim().min(1),
  message: z.string().trim().min(1),
});

export async function GET() {
  try {
    const storage = await getStorage();
    const contacts = await storage.getContactMessages();
    return NextResponse.json(contacts, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch contact messages" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = contactPayloadSchema.parse(body);
    const storage = await getStorage();
    const message = await storage.createContactMessage(data);

    await trackVercelServerEvent(request, "contact_form_submit", {
      form_name: "contact_form",
      lead_type: "contact_request",
      page_path: getAnalyticsPathFromUrl(request.headers.get("referer")) ?? "/contact",
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return NextResponse.json(
        { message: validationError.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Failed to create contact message" },
      { status: 500 },
    );
  }
}
