import { NextRequest, NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { ANALYTICS_EVENTS, getAnalyticsPathFromUrl } from "@shared/analytics";
import { isHoneypotTripped } from "@shared/formspree";
import { insertNewsletterSubscriptionSchema } from "@shared/schema";
import { getStorage } from "../../../server/storage/repository";
import { trackVercelServerEvent } from "../../../server/vercelAnalytics";
import { validateJsonRequest } from "../../../server/requestPolicy";

export async function POST(request: NextRequest) {
  try {
    const requestError = validateJsonRequest(request, 8 * 1024);
    if (requestError) return requestError;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Request body must be valid JSON." },
        { status: 400 },
      );
    }

    // Same decoy field the contact and schedule endpoints use: bots that fill
    // it get a success response but are never stored.
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

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

    await trackVercelServerEvent(request, ANALYTICS_EVENTS.newsletterSignup, {
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
