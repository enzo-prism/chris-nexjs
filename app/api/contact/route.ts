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
import { insertContactMessageSchema } from "@shared/schema";
import {
  describeLeadAttribution,
  type LeadAttribution,
} from "@shared/attribution";
import { leadAttributionSchema } from "@shared/attributionSchema";
import { isAcceptedContactInboxBody, isContactTestPayload } from "@shared/contactRequestPolicy";
import { getStorage } from "../../../server/storage/repository";
import { trackVercelServerEvent } from "../../../server/vercelAnalytics";
import { validateJsonRequest } from "../../../server/requestPolicy";
import { z } from "zod";

const contactPayloadSchema = insertContactMessageSchema.extend({
  fullName: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  subject: z.string().trim().min(1),
  message: z.string().trim().min(1),
});

type ContactPayload = z.infer<typeof contactPayloadSchema>;

const CONTACT_SUBJECT_LABELS: Record<string, string> = {
  appointment: "Appointment Question",
  billing: "Billing & Insurance",
  services: "Service Inquiry",
  feedback: "Feedback",
  other: "Other",
};

// Deliver the contact message to the office inbox. This is the durable
// delivery path: a DB write alone notifies no one, so submissions must reach
// the inbox for us to report success to the patient.
const postContactToFormspree = async (
  formspreeEndpoint: string,
  data: ContactPayload,
  context: {
    referer: string | null;
    pagePath: string;
    attribution?: LeadAttribution;
  },
) => {
  const subjectLabel = CONTACT_SUBJECT_LABELS[data.subject] ?? data.subject;

  const formPayload = {
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    subject: subjectLabel,
    message: data.message,
    site: FORMSPREE_OPS_SITE,
    form_key: "contact_form",
    page_path: context.pagePath,
    referrer: context.referer ?? "",
    lead_channel: context.attribution?.channel ?? "unknown",
    lead_source_detail: describeLeadAttribution(context.attribution),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "production",
    [FORMSPREE_OPS_QA_FIELD]: "false",
    _replyto: data.email,
    _subject: `Contact form: ${subjectLabel}`,
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

  const acknowledgement: unknown = await response.json().catch(() => null);
  if (!response.ok || !isAcceptedContactInboxBody(acknowledgement)) {
    // Never log the provider body: it can contain contact details.
    throw new Error(`Contact office inbox did not accept the request (${response.status}).`);
  }
};

export async function POST(request: NextRequest) {
  try {
    const requestError = validateJsonRequest(request);
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

    // Silently accept honeypot-tripped submissions so bots see success but
    // nothing reaches the office inbox or the database.
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ ok: true, accepted: false }, { status: 201 });
    }

    const data = contactPayloadSchema.parse(body);

    // Server-owned preview mode and explicit ops QA submissions exercise
    // validation without inbox delivery, persistence, or acquisition events.
    if (process.env.VERCEL_ENV === "preview" || isContactTestPayload(body)) {
      return NextResponse.json(
        { ok: true, accepted: false, ...(process.env.VERCEL_ENV === "preview" ? { preview: true } : { test: true }) },
        { status: 200, headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const referer = request.headers.get("referer");
    const pagePath = getAnalyticsPathFromUrl(referer) ?? "/contact";
    // Attribution is optional context: a malformed value is dropped rather
    // than rejecting the patient's message.
    const parsedAttribution = leadAttributionSchema.safeParse(
      (body as Record<string, unknown>).attribution,
    );
    const attribution = parsedAttribution.success
      ? parsedAttribution.data
      : undefined;

    // Forward to the office inbox first; if this throws we surface a real
    // error instead of a false "Message sent!" confirmation.
    await postContactToFormspree(getPublicFormspreeEndpoint(), data, {
      referer,
      pagePath,
      attribution,
    });

    // Best-effort persistence — never block lead delivery on DB availability.
    try {
      const storage = await getStorage();
      await storage.createContactMessage(data);
    } catch (storageError) {
      console.error("[contact] Failed to persist contact message:", storageError);
    }

    await trackVercelServerEvent(request, ANALYTICS_EVENTS.contactFormSubmit, {
      form_name: "contact_form",
      lead_type: "contact_request",
      lead_channel: attribution?.channel ?? "unknown",
      page_path: pagePath,
    });

    return NextResponse.json({ ok: true, accepted: true }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return NextResponse.json(
        { message: validationError.message },
        { status: 400 },
      );
    }

    console.error("[contact] Failed to deliver contact message:", error);
    return NextResponse.json(
      {
        message:
          "We couldn't send your message. Please call the office or try again.",
      },
      { status: 500 },
    );
  }
}
