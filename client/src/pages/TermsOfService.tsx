// Terms text is unchanged from the July 15, 2026 version except the payment
// and insurance lines, corrected on 2026-10-16 to match the accepted methods
// in AGENTS.md (Visa, MasterCard, FSA/HSA, in-house plan; PPO out-of-network).
// Quiet page: no seasonal decoration.
import Link from "next/link";

import { LegalPage, type LegalSection } from "@/components/patients/LegalPage";
import { officeInfo } from "@/lib/data";

const sections: readonly LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement to Terms",
    content: (
      <p>
        By accessing and using the website of {officeInfo.name} and receiving dental services at our practice, you
        agree to be bound by these Terms of Service and all applicable laws and regulations.
      </p>
    ),
  },
  {
    id: "use-of-website",
    title: "Use of Website",
    content: (
      <>
        <h3>Permitted Use</h3>
        <p>You may use our website for:</p>
        <ul>
          <li>Learning about our dental services and practice</li>
          <li>Scheduling appointments</li>
          <li>Accessing patient resources and educational materials</li>
          <li>Contacting our office</li>
        </ul>

        <h3>Prohibited Use</h3>
        <p>You may not use our website to:</p>
        <ul>
          <li>Violate any local, state, or federal laws</li>
          <li>Transmit harmful, threatening, or offensive content</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with the proper functioning of the website</li>
          <li>Use automated systems to access the website</li>
        </ul>
      </>
    ),
  },
  {
    id: "patient-responsibilities",
    title: "Patient Responsibilities",
    content: (
      <>
        <h3>Appointment Scheduling</h3>
        <ul>
          <li>Provide accurate and complete information when scheduling appointments</li>
          <li>Arrive on time for scheduled appointments</li>
          <li>Provide at least 24 hours notice for appointment cancellations</li>
          <li>Update us with any changes to your contact information or insurance</li>
        </ul>

        <h3>Medical Information</h3>
        <ul>
          <li>Provide complete and accurate medical and dental history</li>
          <li>Inform us of any changes to your health status or medications</li>
          <li>Follow all pre and post-treatment instructions</li>
          <li>Ask questions if you don&apos;t understand any aspect of your treatment</li>
        </ul>
      </>
    ),
  },
  {
    id: "practice-policies",
    title: "Practice Policies",
    content: (
      <>
        <h3>Cancellation Policy</h3>
        <p>
          We require at least 24 hours advance notice for appointment cancellations. Failure to provide adequate
          notice or repeated no-shows may result in a cancellation fee.
        </p>

        <h3>Payment Policy</h3>
        <ul>
          <li>Payment is due at the time of service unless prior arrangements have been made</li>
          <li>
            We accept Visa, MasterCard, and FSA/HSA funds, and offer an in-house dental plan. We work with PPO
            dental insurance plans as an out-of-network provider
          </li>
          <li>Patients are responsible for understanding their insurance benefits and coverage</li>
          <li>Outstanding balances may be subject to interest charges</li>
        </ul>

        <h3>Insurance</h3>
        <p>
          We are an out-of-network provider for PPO dental plans, and you are ultimately responsible for payment of
          services. We will assist with insurance claims as a courtesy, but insurance payment is between you and your
          insurance company.
        </p>
      </>
    ),
  },
  {
    id: "treatment-and-consent",
    title: "Treatment and Consent",
    content: (
      <ul>
        <li>All treatment recommendations are based on our professional judgment</li>
        <li>You have the right to accept or decline any recommended treatment</li>
        <li>Treatment outcomes cannot be guaranteed</li>
        <li>You are responsible for following all post-treatment care instructions</li>
        <li>Emergency treatment may be provided without prior consultation</li>
      </ul>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    content: (
      <p>
        To the fullest extent permitted by law, {officeInfo.name} shall not be liable for any indirect, incidental,
        special, or consequential damages arising from your use of our website or services.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    content: (
      <p>
        All content on this website, including text, images, logos, and design elements, is the property of{" "}
        {officeInfo.name} and is protected by copyright and trademark laws. You may not reproduce, distribute, or use
        any content without our written permission.
      </p>
    ),
  },
  {
    id: "privacy",
    title: "Privacy and Confidentiality",
    content: (
      <p>
        We are committed to protecting your privacy and maintaining the confidentiality of your personal and medical
        information in accordance with HIPAA regulations. Please review our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link> for detailed information about our privacy practices.
      </p>
    ),
  },
  {
    id: "modifications",
    title: "Modifications to Terms",
    content: (
      <p>
        We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon
        posting on our website. Your continued use of our services constitutes acceptance of the modified terms.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Law",
    content: (
      <p>
        These Terms of Service are governed by the laws of the State of California. Any disputes arising from these
        terms will be resolved in the appropriate courts of Santa Clara County, California.
      </p>
    ),
  },
];

const TermsOfService = () => (
  <LegalPage
    title="Terms of Service"
    crumbName="Terms of Service"
    path="/terms"
    eyebrow="Website terms"
    meta={
      <>
        Website terms version: <time dateTime="2026-10-16">October 16, 2026</time>
      </>
    }
    sections={sections}
    contactTitle="Contact Information"
    contactIntro="If you have questions about these Terms of Service, please contact us:"
  />
);

export default TermsOfService;
