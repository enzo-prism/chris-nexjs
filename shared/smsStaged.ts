/**
 * Staged SMS copy. Import from tests only — never from client, app, or
 * shared/sms.ts. These strings must not appear in a production JS chunk.
 *
 * Does not import ./sms.ts so a mistaken re-export from that file cannot
 * form a circular graph before the unused-copy guard runs.
 */
import { officeInfo } from "./officeInfo";
import { CANONICAL_HOST } from "./robots";

/** Keep in lockstep with SMS_BRAND_NAME in ./sms.ts (enforced by sms-copy.test.ts). */
const STAGED_BRAND_NAME = "Christopher B. Wong, DDS";
const STAGED_PRIVACY_PATH = "/privacy-policy";
const STAGED_TERMS_PATH = "/sms-terms";

export const SMS_PRIVACY_URL = `https://${CANONICAL_HOST}${STAGED_PRIVACY_PATH}`;
export const SMS_TERMS_URL = `https://${CANONICAL_HOST}${STAGED_TERMS_PATH}`;

/**
 * Legal-page version date for SMS copy after approval.
 *
 * TODO: Set this ISO date and label when Dr. Wong approves the SMS wording
 * and the 10DLC brand name. Pages must not import these until then.
 */
export const SMS_COPY_EFFECTIVE_DATE_ISO = "PENDING-APPROVAL";
export const SMS_COPY_EFFECTIVE_DATE_LABEL = "Pending approval";

/**
 * Staged website opt-in checkbox label. Unused by any form yet.
 * When wired, the control must stay unchecked until the patient opts in.
 */
export const SMS_OPT_IN_DEFAULT_CHECKED = false;

/**
 * Staged website opt-in checkbox copy. Unused by any form yet.
 * Uses absolute Privacy Policy and SMS Terms URLs.
 */
export const SMS_OPT_IN_CHECKBOX =
  `Yes, text me appointment reminders and a short request to review my visit from ${STAGED_BRAND_NAME}. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out or HELP for help. Consent isn't required to receive care. Privacy Policy: ${SMS_PRIVACY_URL}. SMS Terms: ${SMS_TERMS_URL}.`;

/**
 * Staged first confirmation text after a successful opt-in. Unused by any form yet.
 */
export const SMS_FIRST_CONFIRMATION =
  `${STAGED_BRAND_NAME}: Thanks for signing up for visit texts! Msg frequency varies. Msg & data rates may apply. Reply HELP for help, STOP to opt out.`;

/**
 * Staged HELP auto-reply. Unused by any sender yet.
 */
export const SMS_HELP_AUTO_REPLY =
  `${STAGED_BRAND_NAME}: For help call ${officeInfo.phone} or email ${officeInfo.email}. Msg & data rates may apply. Reply STOP to opt out.`;

/**
 * Staged STOP auto-reply. Unused by any sender yet.
 *
 * A STOP confirmation text depends on ReviewFlow, the texting provider,
 * actually sending one. That behavior is unconfirmed and must not be
 * stated on the public site.
 */
export const SMS_STOP_AUTO_REPLY =
  `${STAGED_BRAND_NAME}: You are unsubscribed and will not receive more texts. Reply HELP for help.`;
