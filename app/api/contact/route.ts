import { NextRequest, NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { ANALYTICS_EVENTS, getAnalyticsPathFromUrl } from "@shared/analytics";
import {
  FORMSPREE_OPS_QA_FIELD,
  FORMSPREE_OPS_SITE,
  getPublicFormspreeEndpoint,
} from "@shared/formspree";
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
  context: { referer: string | null; pagePath: string },
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
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "No response body");
    throw new Error(
      `Contact office inbox request failed with ${response.status}: ${details.slice(0, 400)}`,
    );
  }
};

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

    const referer = request.headers.get("referer");
    const pagePath = getAnalyticsPathFromUrl(referer) ?? "/contact";

    // Forward to the office inbox first; if this throws we surface a real
    // error instead of a false "Message sent!" confirmation.
    await postContactToFormspree(getPublicFormspreeEndpoint(), data, {
      referer,
      pagePath,
    });

    // Best-effort persistence — never block lead delivery on DB availability.
    let message: unknown = null;
    try {
      const storage = await getStorage();
      message = await storage.createContactMessage(data);
    } catch (storageError) {
      console.error("[contact] Failed to persist contact message:", storageError);
    }

    await trackVercelServerEvent(request, ANALYTICS_EVENTS.contactFormSubmit, {
      form_name: "contact_form",
      lead_type: "contact_request",
      page_path: pagePath,
    });

    return NextResponse.json(message ?? { ok: true }, { status: 201 });
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
