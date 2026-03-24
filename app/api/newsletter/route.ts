import { NextRequest, NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { getAnalyticsPathFromUrl } from "@shared/analytics";
import { insertNewsletterSubscriptionSchema } from "@shared/schema";
import { getStorage } from "../../../server/storage/repository";
import { trackVercelServerEvent } from "../../../server/vercelAnalytics";

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

    await trackVercelServerEvent(request, "newsletter_signup", {
      form_name: "newsletter_form",
      lead_type: "newsletter_signup",
      page_path: getAnalyticsPathFromUrl(request.headers.get("referer")) ?? "/",
    });

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
