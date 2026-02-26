import { NextRequest, NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";
import { ZodError, z } from "zod";

const formRequestSchema = z.object({
  emergency: z.boolean(),
  appointmentType: z.enum([
    "New Patient Exam & Cleaning",
    "Existing Patient Checkup",
    "Invisalign Consultation",
    "Cosmetic Consultation",
    "Emergency Visit",
    "Other",
  ]),
  preferredDays: z
    .array(
      z.enum([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ]),
    )
    .min(1, "Please select at least one preferred day."),
  preferredTimeOfDay: z.enum([
    "Morning (8am-11am)",
    "Midday (11am-2pm)",
    "Afternoon (2pm-5pm)",
    "First Available",
  ]),
  firstName: z.string().trim().min(1).max(40),
  lastName: z.string().trim().min(1).max(40),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => /^\d{10}$/.test(value), "Phone number must be 10 digits."),
  email: z.string().trim().email(),
  insuranceStatus: z.enum(["Yes", "No", "Not Sure"]).optional(),
  additionalNotes: z.string().trim().max(300).optional(),
  sourceUrl: z.string().trim().url().optional(),
  utmParams: z.record(z.string()).optional(),
});

type ScheduleRequest = z.infer<typeof formRequestSchema>;

type ForwardingResult = {
  enabled: boolean;
  sent: boolean;
  error?: string;
};

const parseUtmParams = (url: string | null | undefined) => {
  if (!url) {
    return {};
  }

  try {
    const parsedUrl = new URL(url);
    const params = parsedUrl.searchParams;
    const keys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ];

    const values: Record<string, string> = {};
    for (const key of keys) {
      const value = params.get(key);
      if (value) {
        values[key] = value;
      }
    }

    return values;
  } catch {
    return {};
  }
};

const mergeUtmParams = (
  sourceUrl: string | null | undefined,
  clientParams: Record<string, string> | undefined,
) => {
  const sourceUtm = parseUtmParams(sourceUrl);
  const merged = { ...sourceUtm };

  for (const [key, value] of Object.entries(clientParams ?? {})) {
    if (key.startsWith("utm_") && value) {
      merged[key] = value;
    }
  }

  return merged;
};

const buildInboxMessage = (data: ScheduleRequest & { sourceUrl: string | null; utm: Record<string, string>; timestamp: string; }) => {
  return [
    "New Appointment Request",
    `Name: ${data.firstName} ${data.lastName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Appointment type: ${data.appointmentType}`,
    `Urgent: ${data.emergency ? "Yes" : "No"}`,
    `Preferred days: ${data.preferredDays.join(", ")}`,
    `Preferred time: ${data.preferredTimeOfDay}`,
    `Insurance status: ${data.insuranceStatus ?? "Not provided"}`,
    `Source URL: ${data.sourceUrl ?? "Unknown"}`,
    `UTM: ${JSON.stringify(data.utm || {})}`,
    `Submitted: ${data.timestamp}`,
    `Notes: ${data.additionalNotes || "None"}`,
  ].join("\n");
};

const postJsonWebhook = async (url: string, payload: unknown): Promise<void> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "No response body");
    throw new Error(
      `Webhook request failed with ${response.status}: ${details.slice(0, 400)}`,
    );
  }
};

const postToFormspree = async (
  formspreeEndpoint: string,
  payload: ScheduleRequest & { sourceUrl: string; utm: Record<string, string>; timestamp: string },
) => {
  const formPayload = {
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    appointment_type: payload.appointmentType,
    urgent: payload.emergency ? "Yes" : "No",
    preferred_days: payload.preferredDays.join(", "),
    preferred_time_of_day: payload.preferredTimeOfDay,
    insurance_status: payload.insuranceStatus ?? "Not provided",
    source_url: payload.sourceUrl,
    timestamp: payload.timestamp,
    utm_source: payload.utm.utm_source,
    utm_medium: payload.utm.utm_medium,
    utm_campaign: payload.utm.utm_campaign,
    utm_term: payload.utm.utm_term,
    utm_content: payload.utm.utm_content,
    additional_notes: payload.additionalNotes ?? "",
    _replyto: payload.email,
    _subject: `Appointment Request: ${payload.appointmentType}`,
    message: buildInboxMessage(payload),
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
      `Office inbox request failed with ${response.status}: ${details.slice(0, 400)}`,
    );
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedBody = formRequestSchema.parse(body);

    const sourceUrl =
      parsedBody.sourceUrl ??
      request.headers.get("referer") ??
      null;
    const utm = mergeUtmParams(sourceUrl, parsedBody.utmParams);

    const payload: ScheduleRequest & {
      sourceUrl: string;
      utm: Record<string, string>;
      phone: string;
      timestamp: string;
    } = {
      ...parsedBody,
      phone: parsedBody.phone.replace(/\D/g, ""),
      sourceUrl: sourceUrl ?? "",
      utm,
      timestamp: new Date().toISOString(),
    };

    const formspreeEndpoint =
      process.env.SCHEDULE_FORM_ENDPOINT ??
      process.env.NEXT_PUBLIC_FORM_ENDPOINT ??
      "";

    if (!formspreeEndpoint) {
      return NextResponse.json(
        { message: "Form endpoint is not configured on the server." },
        { status: 500 },
      );
    }

    await postToFormspree(formspreeEndpoint, payload);

    const crmWebhookUrl = process.env.SCHEDULE_CRM_WEBHOOK_URL;
    const slackWebhookUrl = process.env.SCHEDULE_SLACK_WEBHOOK_URL;

    const crmResult: ForwardingResult = {
      enabled: Boolean(crmWebhookUrl),
      sent: false,
    };
    const slackResult: ForwardingResult = {
      enabled: Boolean(slackWebhookUrl),
      sent: false,
    };

    if (crmWebhookUrl) {
      try {
        await postJsonWebhook(crmWebhookUrl, {
          ...payload,
          destination: "crm",
        });
        crmResult.sent = true;
      } catch (error) {
        crmResult.sent = false;
        crmResult.error =
          error instanceof Error
            ? error.message
            : "Unknown CRM forwarding error.";
      }
    }

    if (slackWebhookUrl) {
      try {
        await postJsonWebhook(slackWebhookUrl, {
          text: buildInboxMessage(payload),
          type: "appointment_request",
          ...payload,
        });
        slackResult.sent = true;
      } catch (error) {
        slackResult.sent = false;
        slackResult.error =
          error instanceof Error
            ? error.message
            : "Unknown Slack forwarding error.";
      }
    }

    return NextResponse.json(
      {
        success: true,
        timestamp: payload.timestamp,
        sourceUrl,
        forwarding: {
          crm: crmResult,
          slack: slackResult,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return NextResponse.json(
        { message: validationError.message },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to submit appointment request.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
