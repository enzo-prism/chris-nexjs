/**
 * Public SMS program constants used by legal pages and SEO.
 *
 * Staged opt-in, confirmation, HELP, and STOP copy lives in ./smsStaged.ts
 * and must be imported only by tests. Do not import that module from
 * client, app, or other shared modules.
 */

/**
 * 10DLC / A2P brand name shown in SMS disclosures.
 *
 * TODO: Confirm this string against the ReviewFlow or 10DLC brand
 * registration before any of this copy goes live.
 */
export const SMS_BRAND_NAME = "Christopher B. Wong, DDS";

export const SMS_TERMS_PATH = "/sms-terms";
export const SMS_PRIVACY_PATH = "/privacy-policy";

/**
 * Carrier-required Privacy Policy sentences. Pending Dr. Wong's approval.
 *
 * Twilio template order: the no-marketing sentence, then the subcontractor
 * exception, then "All other use case categories exclude text messaging
 * originator opt-in data and consent; this information will not be shared
 * with any third parties." Whether that wording is the right policy is
 * Dr. Wong's call.
 */
export const SMS_PRIVACY_SHARING_CATEGORIES_INTRO =
  "We may share your information only in the following categories:";

export const SMS_PRIVACY_SHARING_CATEGORIES = [
  "With your explicit consent",
  "With insurance companies for claims processing",
  "With other healthcare providers involved in your care",
  "With our business associates who assist in providing services",
  "When required by law or legal process",
  "To protect the rights, property, or safety of our practice or others",
] as const;

export const SMS_PRIVACY_NO_MARKETING_SHARE =
  "No mobile information will be shared with third parties/affiliates for marketing/promotional purposes.";

// Twilio template has no comma after "customer service".
export const SMS_PRIVACY_SUBCONTRACTOR_SHARING =
  "Information sharing to subcontractors in support services, such as customer service is permitted.";

export const SMS_PRIVACY_SHARING_EXCLUSION =
  "All other use case categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.";
