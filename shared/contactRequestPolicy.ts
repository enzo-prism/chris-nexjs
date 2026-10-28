import { FORMSPREE_OPS_QA_FIELD } from "./formspree";
import { isExplicitSuccessBody } from "./scheduleRequestPolicy";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isTrue = (value: unknown): boolean => value === true || value === "true";

export function isContactTestPayload(body: unknown): boolean {
  return isRecord(body) && isTrue(body[FORMSPREE_OPS_QA_FIELD]);
}

export function isAcceptedContactInboxBody(body: unknown): boolean {
  if (!isRecord(body) || body.ok === false || body.success === false ||
      body.accepted === false || body.lead === false || isTrue(body.preview) ||
      isTrue(body.test) || isContactTestPayload(body)) {
    return false;
  }
  if (body.errors != null && (!Array.isArray(body.errors) || body.errors.length > 0)) {
    return false;
  }
  // Formspree's official SDK recognizes a `next` string as success without
  // requiring ok/success flags. It is never used as a navigation destination;
  // the browser still requires our own explicit accepted:true acknowledgement.
  return isExplicitSuccessBody(body) ||
    (typeof body.next === "string" && body.next.trim().length > 0);
}

export type ContactRequestResult = {
  readonly accepted: boolean;
  readonly preview: boolean;
  readonly test: boolean;
};

/** An HTTP success alone never establishes office delivery or a lead. */
export function readContactRequestResult(status: number, body: unknown): ContactRequestResult {
  if (status < 200 || status >= 300 || !isRecord(body) || body.ok !== true ||
      body.success === false || body.lead === false) {
    throw new Error("Contact request was not accepted.");
  }
  const preview = isTrue(body.preview);
  const test = isTrue(body.test) || isContactTestPayload(body);
  if (body.accepted === false || preview || test) {
    return { accepted: false, preview, test };
  }
  if (body.accepted !== true) {
    throw new Error("Contact request was not explicitly accepted.");
  }
  return { accepted: true, preview: false, test: false };
}
