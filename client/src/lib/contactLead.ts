import { ANALYTICS_EVENTS, type AnalyticsPageCategory } from "@shared/analytics";

export const CONTACT_FORM_NAME = "contact_form";

export type ContactLeadProperties = {
  readonly form_name: typeof CONTACT_FORM_NAME;
  readonly lead_type: "contact_request";
  readonly lead_source: typeof CONTACT_FORM_NAME;
  readonly lead_channel: string;
  readonly page_path: string;
  readonly page_category: string;
};

export type ContactLeadInput = {
  readonly accepted: boolean;
  readonly leadChannel: string;
  readonly pagePath: string;
  readonly pageCategory: AnalyticsPageCategory | string;
};

export type ContactLeadEvents = {
  readonly contactFormSubmit: {
    readonly eventName: typeof ANALYTICS_EVENTS.contactFormSubmit;
    readonly properties: ContactLeadProperties;
  };
  readonly generateLead: {
    readonly eventName: typeof ANALYTICS_EVENTS.generateLead;
    readonly properties: ContactLeadProperties;
  };
};

/**
 * Build /contact lead events only after the form backend accepted the
 * inquiry (explicit accepted:true on a 2xx). Validation errors and
 * rejected/neutral acknowledgements return null so generate_lead cannot
 * fire on click or on a failed submit.
 *
 * generate_lead uses the same properties as contact_form_submit — the
 * contract main already shipped.
 */
export function resolveContactLeadEvents(
  input: ContactLeadInput,
): ContactLeadEvents | null {
  if (!input.accepted) return null;

  const properties: ContactLeadProperties = {
    form_name: CONTACT_FORM_NAME,
    lead_type: "contact_request",
    lead_source: CONTACT_FORM_NAME,
    lead_channel: input.leadChannel,
    page_path: input.pagePath,
    page_category: input.pageCategory,
  };

  return {
    contactFormSubmit: {
      eventName: ANALYTICS_EVENTS.contactFormSubmit,
      properties,
    },
    generateLead: {
      eventName: ANALYTICS_EVENTS.generateLead,
      properties,
    },
  };
}
