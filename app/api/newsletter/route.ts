import { NextRequest, NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { insertNewsletterSubscriptionSchema } from "@shared/schema";
import { getStorage } from "../../../server/storage/repository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = insertNewsletterSubscriptionSchema.parse(body);
    const storage = await getStorage();
    const existing = await storage.getNewsletterSubscriptionByEmail(payload.email);
    if (existing) {
      return NextResponse.json(
        {
          message: "Email already subscribed",
          subscription: existing,
        },
        { status: 200 },
      );
    }

    const subscription = await storage.createNewsletterSubscription(payload);
    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return NextResponse.json(
        { message: validationError.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Failed to create newsletter subscription" },
      { status: 500 },
    );
  }
}
