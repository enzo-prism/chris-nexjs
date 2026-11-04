// Quiet page: no seasonal decoration. Wording is staged pending Dr. Wong
// approval of the SMS copy and the 10DLC brand name — do not treat as live.
import Link from "next/link";

import { LegalPage, type LegalSection } from "@/components/patients/LegalPage";
import { officeInfo } from "@/lib/data";
import {
  SMS_BRAND_NAME,
  SMS_PRIVACY_NO_MARKETING_SHARE,
  SMS_PRIVACY_PATH,
  SMS_PRIVACY_SHARING_EXCLUSION,
  SMS_PRIVACY_SUBCONTRACTOR_SHARING,
  SMS_TERMS_PATH,
} from "@shared/sms";

const sections: readonly LegalSection[] = [
  {
    id: "program",
    title: "What these texts are for",
    content: (
      <p>
        {SMS_BRAND_NAME} may send text messages about appointment reminders and a
        short post-visit request for a review. These messages are about your
        visits with our Palo Alto office. They are not used for advertising
        unrelated products or services.
      </p>
    ),
  },
  {
    id: "frequency-and-rates",
    title: "How often we text, and rates",
    content: (
      <p>
        Message frequency varies. Message and data rates may apply, depending on
        your mobile carrier and plan.
      </p>
    ),
  },
  {
    id: "opt-out-and-help",
    title: "Opt out and help",
    content: (
      <>
        <p>
          Reply <strong>STOP</strong> to opt out of further texts. Reply{" "}
          <strong>HELP</strong> for help. You can also reach the office at{" "}
          <a href={`tel:${officeInfo.phoneE164}`}>{officeInfo.phone}</a> or{" "}
          <a href={`mailto:${officeInfo.email}`}>{officeInfo.email}</a>.
        </p>
        {/*
          A STOP confirmation text depends on ReviewFlow, the texting
          provider, actually sending one. That is unconfirmed and must not
          be stated on this page.
        */}
        <p>
          After you reply STOP, we will stop texting that number unless you opt
          in again.
        </p>
      </>
    ),
  },
  {
    id: "consent-and-care",
    title: "Consent and care",
    content: (
      <p>
        Consent to receive text messages is not required to receive care. You
        can decline texts and still schedule visits, get treatment, and stay a
        patient of the practice.
      </p>
    ),
  },
  {
    id: "mobile-numbers",
    title: "How we handle mobile numbers",
    content: (
      <p>
        {SMS_PRIVACY_NO_MARKETING_SHARE} {SMS_PRIVACY_SUBCONTRACTOR_SHARING}{" "}
        {SMS_PRIVACY_SHARING_EXCLUSION} How we collect and protect personal
        information, including other use case categories, is described in our{" "}
        <Link href={`${SMS_PRIVACY_PATH}#sharing`}>Privacy Policy</Link>.
      </p>
    ),
  },
  {
    id: "carrier-liability",
    title: "Carrier liability",
    content: (
      <p>
        Mobile carriers are not liable for delayed or undelivered messages.
      </p>
    ),
  },
];

const SmsTerms = () => (
  <LegalPage
    title="SMS Terms"
    crumbName="SMS Terms"
    path={SMS_TERMS_PATH}
    eyebrow="Text messaging"
    meta={null}
    sections={sections}
    contactTitle="Questions about texts"
    contactIntro="If you have questions about these SMS Terms or need help with visit texts, please contact us:"
  />
);

export default SmsTerms;
