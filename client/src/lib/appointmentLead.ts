import { ANALYTICS_EVENTS, type AnalyticsPageCategory } from "@shared/analytics";

export const DEFAULT_APPOINTMENT_LEAD_FORM_NAME = "schedule_request_form";
export const INVISALIGN_CONSULT_FORM_NAME = "invisalign_consult";

export type AppointmentLeadInput = {
  readonly submitted: boolean;
  readonly success: boolean;
  readonly formName: string;
  readonly appointmentType: string;
  readonly schedulingMode: string;
  readonly urgentFlag: boolean;
  readonly contactPreference: string;
  readonly leadChannel: string;
  readonly pagePath: string;
  readonly pageCategory: AnalyticsPageCategory | string;
};

export type ScheduleOutcome = {
  readonly submitted: boolean;
  readonly success: boolean;
  readonly leadFired: boolean;
  readonly formName: string;
};

export type AppointmentLeadEvent = {
  readonly eventName: typeof ANALYTICS_EVENTS.appointmentRequestSubmit;
  readonly generateLead: typeof ANALYTICS_EVENTS.generateLead;
  readonly properties: {
    readonly form_name: string;
    readonly lead_type: "appointment_request";
    readonly lead_source: string;
    readonly appointment_type: string;
    readonly scheduling_mode: string;
    readonly urgent_flag: "true" | "false";
    readonly contact_preference: string;
    readonly lead_channel: string;
    readonly page_path: string;
    readonly page_category: string;
  };
};

/**
 * Test/observability seam for schedule outcomes. Production only records
 * when a test (or debug) pre-created `window.__cwScheduleOutcomes`.
 */
export function publishScheduleOutcome(outcome: ScheduleOutcome): void {
  if (typeof window === "undefined") {
    return;
  }

  if (Array.isArray(window.__cwScheduleOutcomes)) {
    window.__cwScheduleOutcomes.push(outcome);
  }

  window.dispatchEvent(
    new CustomEvent("cw:schedule-outcome", {
      detail: outcome,
    }),
  );
}

/**
 * Build the appointment-request lead payload. Returns null unless the
 * request was submitted and the server accepted it, so generate_lead
 * cannot fire on validation or network failure.
 */
export function resolveAppointmentLeadEvent(
  input: AppointmentLeadInput,
): AppointmentLeadEvent | null {
  if (!input.submitted || !input.success) {
    return null;
  }

  return {
    eventName: ANALYTICS_EVENTS.appointmentRequestSubmit,
    generateLead: ANALYTICS_EVENTS.generateLead,
    properties: {
      form_name: input.formName,
      lead_type: "appointment_request",
      lead_source: input.formName,
      appointment_type: input.appointmentType,
      scheduling_mode: input.schedulingMode,
      urgent_flag: input.urgentFlag ? "true" : "false",
      contact_preference: input.contactPreference,
      lead_channel: input.leadChannel,
      page_path: input.pagePath,
      page_category: input.pageCategory,
    },
  };
}
