import { NextRequest, NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { ANALYTICS_EVENTS, getAnalyticsPathFromUrl } from "@shared/analytics";
import {
  FORMSPREE_OPS_QA_FIELD,
  FORMSPREE_OPS_SITE,
  getPublicFormspreeEndpoint,
  isHoneypotTripped,
} from "@shared/formspree";
import { insertNewsletterSubscriptionSchema } from "@shared/schema";
import { getStorage } from "../../../server/storage/repository";
import { trackVercelServerEvent } from "../../../server/vercelAnalytics";
import { validateJsonRequest } from "../../../server/requestPolicy";

// Deliver the signup to the office inbox. Like the contact form, this is the
// durable delivery path: on serverless the DB may be an in-memory fallback, so
// a storage write alone can silently drop the signup.
const postNewsletterToFormspree = async (
  formspreeEndpoint: string,
  email: string,
  context: { referer: string | null; pagePath: string },
) => {
  const formPayload = {
    email,
    site: FORMSPREE_OPS_SITE,
    form_key: "newsletter_signup",
    page_path: context.pagePath,
    referrer: context.referer ?? "",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "production",
    [FORMSPREE_OPS_QA_FIELD]: "false",
    _replyto: email,
    _subject: "Newsletter signup",
  };

  const response = await fetch(formspreeEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formPayload),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "No response body");
    throw new Error(
      `Newsletter office inbox request failed with ${response.status}: ${details.slice(0, 400)}`,
    );
  }
};

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

    // Best-effort duplicate check — on serverless memory storage this only
    // dedupes within one lambda instance, so it must never block delivery.
    try {
      const storage = await getStorage();
      const existing = await storage.getNewsletterSubscriptionByEmail(
        payload.email,
      );
      if (existing) {
        return NextResponse.json(
          {
            message: "Email already subscribed",
            subscription: existing,
          },
          { status: 200 },
        );
      }
    } catch (storageError) {
      console.error(
        "[newsletter] Failed duplicate check, continuing:",
        storageError,
      );
    }

    const referer = request.headers.get("referer");
    const pagePath = getAnalyticsPathFromUrl(referer) ?? "/";

    // Forward to the office inbox first; if this throws we surface a real
    // error instead of a false "Subscribed!" confirmation.
    await postNewsletterToFormspree(getPublicFormspreeEndpoint(), payload.email, {
      referer,
      pagePath,
    });

    // Best-effort persistence — never block lead delivery on DB availability.
    let subscription: unknown = null;
    try {
      const storage = await getStorage();
      subscription = await storage.createNewsletterSubscription(payload);
    } catch (storageError) {
      console.error(
        "[newsletter] Failed to persist subscription:",
        storageError,
      );
    }

    await trackVercelServerEvent(request, ANALYTICS_EVENTS.newsletterSignup, {
      form_name: "newsletter_form",
      lead_type: "newsletter_signup",
      page_path: pagePath,
    });

    return NextResponse.json(subscription ?? { ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return NextResponse.json(
        { message: validationError.message },
        { status: 400 },
      );
    }

    console.error("[newsletter] Failed to deliver newsletter signup:", error);
    return NextResponse.json(
      { message: "Failed to create newsletter subscription" },
      { status: 500 },
    );
  }
}
