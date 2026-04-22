import { NextRequest, NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { getAnalyticsPathFromUrl } from "@shared/analytics";
import { getScheduleFormspreeEndpoint } from "@shared/formspree";
import {
  legacyScheduleRequestSchema,
  normalizeSchedulePhone,
  scheduleRequestV2Schema,
  type ScheduleRequestV2,
} from "@shared/scheduleRequest";
import { trackVercelServerEvent } from "../../../server/vercelAnalytics";

type ForwardingResult = {
  enabled: boolean;
  sent: boolean;
  error?: string;
};

type ScheduleDispatchPayload = Omit<ScheduleRequestV2, "phone"> & {
  phone: string;
  sourceUrl: string;
  utm: Record<string, string>;
  timestamp: string;
};

const normalizeIncomingScheduleRequest = (body: unknown): ScheduleRequestV2 => {
  const parsedV2 = scheduleRequestV2Schema.safeParse(body);
  if (parsedV2.success) {
    return parsedV2.data;
  }

  const legacyPayload = legacyScheduleRequestSchema.parse(body);
  const schedulingMode =
    legacyPayload.preferredTimeOfDay === "First Available"
      ? "first_available"
      : "choose_preferences";

  return scheduleRequestV2Schema.parse({
    appointmentType: legacyPayload.appointmentType,
    isEmergency: legacyPayload.emergency,
    schedulingMode,
    preferredDays:
      schedulingMode === "choose_preferences" ? legacyPayload.preferredDays : undefined,
    preferredTime:
      schedulingMode === "choose_preferences"
        ? legacyPayload.preferredTimeOfDay
        : undefined,
    firstName: legacyPayload.firstName,
    lastName: legacyPayload.lastName,
    phone: legacyPayload.phone,
    email: legacyPayload.email,
    contactPreference: "phone",
    insuranceProvider: legacyPayload.insuranceStatus,
    message: legacyPayload.additionalNotes,
    source: "schedule_page_form_v1",
    sourceUrl: legacyPayload.sourceUrl,
    utmParams: legacyPayload.utmParams,
  });
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

const sanitizeOptionalText = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const buildInboxMessage = (data: ScheduleDispatchPayload) => {
  const prefersSpecificWindow = data.schedulingMode === "choose_preferences";
  const preferredDays = prefersSpecificWindow
    ? data.preferredDays?.join(", ") ?? "Not provided"
    : "First available";
  const preferredTime = prefersSpecificWindow
    ? data.preferredTime ?? "Not provided"
    : "First available";

  return [
    "New Appointment Request",
    `Name: ${data.firstName} ${data.lastName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Appointment type: ${data.appointmentType}`,
    `Urgent: ${data.isEmergency ? "Yes" : "No"}`,
    `Scheduling mode: ${data.schedulingMode}`,
    `Preferred days: ${preferredDays}`,
    `Preferred time: ${preferredTime}`,
    `Contact preference: ${data.contactPreference}`,
    `Insurance provider: ${data.insuranceProvider ?? "Not provided"}`,
    `Source URL: ${data.sourceUrl ?? "Unknown"}`,
    `Source: ${data.source ?? "Not provided"}`,
    `UTM: ${JSON.stringify(data.utm || {})}`,
    `Submitted: ${data.timestamp}`,
    `Notes: ${data.message || "None"}`,
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
  payload: ScheduleDispatchPayload,
) => {
  const prefersSpecificWindow = payload.schedulingMode === "choose_preferences";
  const preferredDays = prefersSpecificWindow
    ? payload.preferredDays?.join(", ") ?? ""
    : "First available";
  const preferredTime = prefersSpecificWindow
    ? payload.preferredTime ?? ""
    : "First available";

  const formPayload = {
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    appointment_type: payload.appointmentType,
    urgent: payload.isEmergency ? "Yes" : "No",
    preferred_days: preferredDays,
    preferred_time_of_day: preferredTime,
    scheduling_mode: payload.schedulingMode,
    contact_preference: payload.contactPreference,
    insurance_status: payload.insuranceProvider ?? "Not provided",
    source_url: payload.sourceUrl,
    source: payload.source ?? "schedule_page_form",
    timestamp: payload.timestamp,
    utm_source: payload.utm.utm_source,
    utm_medium: payload.utm.utm_medium,
    utm_campaign: payload.utm.utm_campaign,
    utm_term: payload.utm.utm_term,
    utm_content: payload.utm.utm_content,
    additional_notes: payload.message ?? "",
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
    const parsedBody = normalizeIncomingScheduleRequest(body);
    const normalizedPhone = normalizeSchedulePhone(parsedBody.phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { message: "Phone number must include 10 digits (or 11 digits starting with 1)." },
        { status: 400 },
      );
    }

    const sourceUrl =
      parsedBody.sourceUrl ??
      request.headers.get("referer") ??
      null;
    const utm = mergeUtmParams(sourceUrl, parsedBody.utmParams);

    const payload: ScheduleDispatchPayload = {
      ...parsedBody,
      phone: normalizedPhone,
      insuranceProvider: sanitizeOptionalText(parsedBody.insuranceProvider),
      message: sanitizeOptionalText(parsedBody.message),
      source: sanitizeOptionalText(parsedBody.source),
      sourceUrl: sourceUrl ?? "",
      utm,
      timestamp: new Date().toISOString(),
    };

    const formspreeEndpoint = getScheduleFormspreeEndpoint();

    if (!formspreeEndpoint) {
      return NextResponse.json(
        { message: "Form endpoint is not configured on the server." },
        { status: 500 },
      );
    }

    await postToFormspree(formspreeEndpoint, payload);

    await trackVercelServerEvent(request, "appointment_request_submit", {
      appointment_type: payload.appointmentType,
      scheduling_mode: payload.schedulingMode,
      urgent_flag: payload.isEmergency,
      lead_type: "appointment_request",
      page_path: getAnalyticsPathFromUrl(sourceUrl) ?? "/schedule",
      source: payload.source ?? "schedule_page_form",
    });

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
