// Notice text is unchanged; only the layout moved to the Rooted LegalPage.
// The effective date used to render `new Date().toLocaleDateString()`, which
// changed daily (legally wrong) and caused a React #418 hydration mismatch.
// It is now fixed to the date this notice's content last changed in the repo
// (git log for this file: 2026-02-25). Update it whenever the notice changes.
// Quiet page: no seasonal decoration.
import { LegalPage, type LegalSection } from "@/components/patients/LegalPage";
import { officeInfo } from "@/lib/data";

const EFFECTIVE_DATE_ISO = "2026-02-25";
const EFFECTIVE_DATE_LABEL = "February 25, 2026";

const sections: readonly LegalSection[] = [
  {
    id: "your-rights-overview",
    title: "Your Rights Regarding Your Health Information",
    content: (
      <p>
        This notice describes how medical information about you may be used and disclosed and how you can get access
        to this information. Please review it carefully.
      </p>
    ),
  },
  {
    id: "our-commitment",
    title: "Our Commitment to Your Privacy",
    content: (
      <p>
        {officeInfo.name} is committed to protecting your health information. We are required by law to maintain the
        privacy of your protected health information (PHI) and to provide you with this notice of our legal duties and
        privacy practices.
      </p>
    ),
  },
  {
    id: "uses-and-disclosures",
    title: "How We May Use and Disclose Your Health Information",
    content: (
      <>
        <h3>Treatment</h3>
        <p>
          We may use your health information to provide you with dental treatment and services. For example,
          information obtained by a dentist, dental hygienist, or other member of your healthcare team will be
          recorded in your record and used to determine the course of treatment that should work best for you.
        </p>

        <h3>Payment</h3>
        <p>
          Your health information may be used to seek payment for treatment and services provided to you. For
          example, a bill may be sent to you or a third-party payer. The information on or accompanying the bill may
          include information that identifies you, as well as your diagnosis, procedures, and supplies used.
        </p>

        <h3>Healthcare Operations</h3>
        <p>
          We may use and disclose your health information for healthcare operations. These uses and disclosures are
          necessary to run the practice and make sure that all of our patients receive quality care. For example, we
          may use your health information to review our treatment and services and to evaluate the performance of
          our staff.
        </p>

        <h3>Other Uses and Disclosures</h3>
        <p>We may also use or disclose your health information for the following purposes:</p>
        <ul>
          <li>
            <strong>Appointment reminders:</strong> We may contact you to provide appointment reminders
          </li>
          <li>
            <strong>Treatment alternatives:</strong> We may tell you about or recommend possible treatment options or
            alternatives
          </li>
          <li>
            <strong>Health-related benefits and services:</strong> We may tell you about health-related benefits or
            services that may be of interest to you
          </li>
          <li>
            <strong>Business associates:</strong> We may disclose your health information to business associates that
            perform functions on our behalf
          </li>
          <li>
            <strong>As required by law:</strong> We will disclose your health information when required to do so by
            federal, state, or local law
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "individual-rights",
    title: "Your Individual Rights",
    content: (
      <>
        <h3>Right to Request Restrictions</h3>
        <p>
          You have the right to request a restriction or limitation on the health information we use or disclose
          about you for treatment, payment, or healthcare operations. We are not required to agree to your request,
          but if we do agree, we will comply with your request unless the information is needed to provide you
          emergency treatment.
        </p>

        <h3>Right to Request Confidential Communications</h3>
        <p>
          You have the right to request that we communicate with you about medical matters in a certain way or at a
          certain location. For example, you can ask that we only contact you at work or by mail.
        </p>

        <h3>Right to Inspect and Copy</h3>
        <p>
          You have the right to inspect and copy health information that may be used to make decisions about your
          care. To inspect and copy your health information, you must submit your request in writing. We may charge a
          fee for the costs of copying, mailing, or other supplies associated with your request.
        </p>

        <h3>Right to Amend</h3>
        <p>
          If you feel that health information we have about you is incorrect or incomplete, you may ask us to amend
          the information. You have the right to request an amendment for as long as the information is kept by or
          for our office.
        </p>

        <h3>Right to an Accounting</h3>
        <p>
          You have the right to request an &quot;accounting of disclosures.&quot; This is a list of the disclosures
          we made of health information about you other than our own uses for treatment, payment, and healthcare
          operations.
        </p>

        <h3>Right to a Paper Copy</h3>
        <p>
          You have the right to obtain a paper copy of this notice from us upon request, even if you have agreed to
          receive the notice electronically.
        </p>
      </>
    ),
  },
  {
    id: "complaints",
    title: "Complaints",
    content: (
      <p>
        If you believe your privacy rights have been violated, you may file a complaint with our office or with the
        Secretary of the Department of Health and Human Services. To file a complaint with our office, contact our
        Privacy Officer. All complaints must be submitted in writing. You will not be penalized for filing a
        complaint.
      </p>
    ),
  },
  {
    id: "federal-complaints",
    title: "Complaints to the Federal Government",
    content: (
      <>
        <p>You may also file a complaint with the U.S. Department of Health and Human Services:</p>
        <address className="not-prose rounded-[1.25rem] border border-cream-300/80 bg-cream-50 px-5 py-4 text-base not-italic leading-7 text-ink-soft">
          <strong className="block text-ink">U.S. Department of Health and Human Services</strong>
          Office for Civil Rights
          <br />
          200 Independence Avenue, S.W.
          <br />
          Washington, D.C. 20201
          <br />
          Phone: 1-877-696-6775
          <br />
          Website: www.hhs.gov/ocr/privacy/hipaa/complaints/
        </address>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Notice",
    content: (
      <p>
        We reserve the right to change this notice and to make the revised or changed notice effective for health
        information we already have about you as well as any information we receive in the future. We will post a
        copy of the current notice in our office.
      </p>
    ),
  },
];

const HipaaNotice = () => (
  <LegalPage
    title="HIPAA Notice of Privacy Practices"
    crumbName="HIPAA Notice"
    path="/hipaa"
    eyebrow="Patient privacy"
    meta={
      <>
        Effective date: <time dateTime={EFFECTIVE_DATE_ISO}>{EFFECTIVE_DATE_LABEL}</time>
      </>
    }
    sections={sections}
    contactTitle="Contact Information"
    contactRole="Privacy Officer"
    contactIntro="If you have any questions about this notice or need to exercise any of your rights described above, please contact our Privacy Officer:"
  />
);

export default HipaaNotice;
