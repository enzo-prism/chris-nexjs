// Quiet page: no seasonal decoration. SMS wording is staged pending
// Dr. Wong approval and must not be treated as live.
import Link from "next/link";

import { LegalPage, type LegalSection } from "@/components/patients/LegalPage";
import { officeInfo } from "@/lib/data";
import {
  SMS_BRAND_NAME,
  SMS_PRIVACY_NO_MARKETING_SHARE,
  SMS_PRIVACY_SHARING_CATEGORIES,
  SMS_PRIVACY_SHARING_CATEGORIES_INTRO,
  SMS_PRIVACY_SHARING_EXCLUSION,
  SMS_PRIVACY_SUBCONTRACTOR_SHARING,
  SMS_TERMS_PATH,
} from "@shared/sms";

const sections: readonly LegalSection[] = [
  {
    id: "our-commitment",
    title: "Our Commitment to Your Privacy",
    content: (
      <p>
        At {officeInfo.name}, we are committed to protecting your privacy and maintaining the confidentiality of
        your personal information. This Privacy Policy explains how we collect, use, and protect your information
        when you visit our website or receive dental services at our practice.
      </p>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: (
      <>
        <h3>Personal Information</h3>
        <p>We may collect the following types of personal information:</p>
        <ul>
          <li>Contact information (name, address, phone number, email address)</li>
          <li>Demographic information (age, date of birth, gender)</li>
          <li>Health information and medical history</li>
          <li>Insurance information</li>
          <li>Payment and billing information</li>
          <li>Appointment scheduling information</li>
        </ul>

        <h3>Website Information</h3>
        <p>When you visit our website, we may automatically collect:</p>
        <ul>
          <li>IP address and browser information</li>
          <li>Pages visited and time spent on our site</li>
          <li>Referring website information</li>
          <li>Device type and operating system</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    content: (
      <>
        <p>We use your personal information for the following purposes:</p>
        <ul>
          <li>Providing dental care and treatment</li>
          <li>Scheduling and managing appointments</li>
          <li>Processing insurance claims and billing</li>
          <li>Communicating about your treatment and care</li>
          <li>Sending appointment reminders and follow-up care instructions</li>
          <li>Improving our services and patient experience</li>
          <li>Complying with legal and regulatory requirements</li>
        </ul>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Information Sharing and Disclosure",
    content: (
      <>
        <p>
          We do not sell, trade, or rent your personal information to third parties.{" "}
          {SMS_PRIVACY_SHARING_CATEGORIES_INTRO}
        </p>
        <ul>
          {SMS_PRIVACY_SHARING_CATEGORIES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          {SMS_PRIVACY_NO_MARKETING_SHARE} {SMS_PRIVACY_SUBCONTRACTOR_SHARING}{" "}
          {SMS_PRIVACY_SHARING_EXCLUSION}
        </p>
      </>
    ),
  },
  {
    id: "data-security",
    title: "Data Security",
    content: (
      <>
        <p>
          We implement appropriate physical, electronic, and administrative safeguards to protect your personal
          information against unauthorized access, alteration, disclosure, or destruction. Our security measures
          include:
        </p>
        <ul>
          <li>Encrypted data transmission and storage</li>
          <li>Access controls and user authentication</li>
          <li>Regular security assessments and updates</li>
          <li>Staff training on privacy and security practices</li>
          <li>Secure disposal of confidential information</li>
        </ul>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights",
    content: (
      <>
        <p>You have the right to:</p>
        <ul>
          <li>Access and review your personal information</li>
          <li>Request corrections to inaccurate information</li>
          <li>Request restrictions on the use of your information</li>
          <li>Request an accounting of disclosures</li>
          <li>File a complaint if you believe your privacy rights have been violated</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Website Cookies",
    content: (
      <p>
        Our website uses cookies to enhance your browsing experience and analyze website traffic. You can configure
        your browser to refuse cookies, but this may limit your ability to use certain features of our website.
      </p>
    ),
  },
  {
    id: "third-party-services",
    title: "Third-Party Services",
    content: (
      <p>
        Our website may contain links to third-party websites or use third-party services (such as Google
        Analytics). We are not responsible for the privacy practices of these third parties. We encourage you to
        review their privacy policies.
      </p>
    ),
  },
  {
    id: "text-messaging",
    title: "Text Messaging",
    content: (
      <>
        <p>
          {SMS_BRAND_NAME} may send text messages for appointment reminders and a
          short post-visit request for a review. Message frequency varies.
          Message and data rates may apply.
        </p>
        <p>
          Reply <strong>STOP</strong> to opt out of further texts. Reply{" "}
          <strong>HELP</strong> for help. You can also contact the office at{" "}
          <a href={`tel:${officeInfo.phoneE164}`}>{officeInfo.phone}</a> or{" "}
          <a href={`mailto:${officeInfo.email}`}>{officeInfo.email}</a>.
        </p>
        <p>
          Consent to receive text messages is not required to receive care.
        </p>
        <p>
          {SMS_PRIVACY_NO_MARKETING_SHARE} {SMS_PRIVACY_SUBCONTRACTOR_SHARING}{" "}
          {SMS_PRIVACY_SHARING_EXCLUSION} The practice's other information-sharing
          categories are listed under{" "}
          <a href="#sharing">Information Sharing and Disclosure</a>.
        </p>
        <p>
          Mobile carriers are not liable for delayed or undelivered messages.
          The full program terms are in our{" "}
          <Link href={SMS_TERMS_PATH}>SMS Terms</Link>.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any material changes by posting
        the updated policy on our website with a new effective date.
      </p>
    ),
  },
];

const PrivacyPolicy = () => (
  <LegalPage
    title="Privacy Policy"
    crumbName="Privacy Policy"
    path="/privacy-policy"
    eyebrow="Your privacy"
    meta={
      <>
        Website policy version: <time dateTime="2026-07-15">July 15, 2026</time>
      </>
    }
    sections={sections}
    contactTitle="Contact Us"
    contactIntro="If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:"
  />
);

export default PrivacyPolicy;
