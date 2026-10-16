// Reviewed 2026-10-16 with the Rooted redesign: added the reduced-motion and
// tap-target features the new design system provides. The "last updated"
// line used to render `new Date().toLocaleDateString()` (a React #418
// hydration mismatch, and a date that changed daily); it is now a fixed date.
// Update LAST_UPDATED whenever this statement changes. Quiet page.
import { LegalPage, type LegalSection } from "@/components/patients/LegalPage";
import { officeInfo } from "@/lib/data";

const LAST_UPDATED_ISO = "2026-10-16";
const LAST_UPDATED_LABEL = "October 16, 2026";

const sections: readonly LegalSection[] = [
  {
    id: "our-commitment",
    title: "Our Commitment to Accessibility",
    content: (
      <p>
        At {officeInfo.name}, we are committed to ensuring that our website and dental services are accessible to
        everyone, including individuals with disabilities. We believe that everyone deserves equal access to quality
        dental care and information about our services.
      </p>
    ),
  },
  {
    id: "standards",
    title: "Web Accessibility Standards",
    content: (
      <>
        <p>
          We strive to make our website accessible in accordance with the Web Content Accessibility Guidelines (WCAG)
          2.1 Level AA standards. These guidelines help make web content more accessible to people with disabilities,
          including:
        </p>
        <ul>
          <li>Visual impairments (blindness, low vision, color blindness)</li>
          <li>Hearing impairments (deafness, hearing loss)</li>
          <li>Motor disabilities (difficulty using a mouse, slow response time)</li>
          <li>Cognitive disabilities (learning disabilities, memory limitations)</li>
        </ul>
      </>
    ),
  },
  {
    id: "features",
    title: "Accessibility Features",
    content: (
      <>
        <p>Our website includes the following accessibility features:</p>
        <ul>
          <li>Keyboard navigation support for all interactive elements</li>
          <li>Alternative text descriptions for images</li>
          <li>Proper heading structure for screen readers</li>
          <li>High contrast color schemes for better visibility</li>
          <li>Readable fonts and appropriate text sizing</li>
          <li>Clear and descriptive link text</li>
          <li>Form labels and instructions for screen readers</li>
          <li>Skip navigation links for keyboard users</li>
          <li>Buttons and links sized for easy tapping on phones and tablets</li>
          <li>Non-essential animation turns off when your device is set to reduce motion</li>
        </ul>
      </>
    ),
  },
  {
    id: "physical-office",
    title: "Physical Office Accessibility",
    content: (
      <>
        <p>Our dental office is designed to be accessible to patients with disabilities:</p>
        <ul>
          <li>ADA-compliant wheelchair accessibility</li>
          <li>Accessible parking spaces</li>
          <li>Wide doorways and hallways</li>
          <li>Accessible restroom facilities</li>
          <li>Lowered reception counter areas</li>
          <li>Clear pathways throughout the office</li>
          <li>Accessible dental chairs with transfer assistance available</li>
        </ul>
      </>
    ),
  },
  {
    id: "communication",
    title: "Communication Accommodations",
    content: (
      <>
        <p>
          We provide various communication accommodations to ensure all patients can effectively communicate with our
          team:
        </p>
        <ul>
          <li>Large print materials upon request</li>
          <li>Patient forms available in alternative formats</li>
          <li>Sign language interpreter services (with advance notice)</li>
          <li>Written communication for patients with hearing impairments</li>
          <li>Extended appointment times when needed</li>
          <li>Clear verbal explanations of procedures</li>
        </ul>
      </>
    ),
  },
  {
    id: "assistive-technology",
    title: "Assistive Technology Support",
    content: (
      <>
        <p>Our website is designed to work with various assistive technologies, including:</p>
        <ul>
          <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
          <li>Voice recognition software</li>
          <li>Screen magnification tools</li>
          <li>Alternative keyboards and pointing devices</li>
          <li>Switch navigation devices</li>
        </ul>
      </>
    ),
  },
  {
    id: "ongoing-improvements",
    title: "Ongoing Improvements",
    content: (
      <>
        <p>
          We are continuously working to improve the accessibility of our website and services. Our efforts include:
        </p>
        <ul>
          <li>Regular accessibility audits and testing</li>
          <li>Staff training on accessibility best practices</li>
          <li>User feedback incorporation</li>
          <li>Technology updates to support newer accessibility standards</li>
          <li>Collaboration with accessibility experts</li>
        </ul>
      </>
    ),
  },
  {
    id: "third-party-content",
    title: "Third-Party Content",
    content: (
      <p>
        While we strive to ensure that all content on our website is accessible, some third-party content may not meet
        the same accessibility standards. We work with our vendors and partners to improve accessibility whenever
        possible.
      </p>
    ),
  },
  {
    id: "alternative-access",
    title: "Alternative Access Methods",
    content: (
      <>
        <p>
          If you are unable to access information on our website, we can provide the same information through
          alternative methods:
        </p>
        <ul>
          <li>Phone consultation about our services</li>
          <li>Printed materials mailed to your address</li>
          <li>In-person discussion during your visit</li>
          <li>Email communication with detailed information</li>
        </ul>
      </>
    ),
  },
  {
    id: "legal-compliance",
    title: "Legal Compliance",
    content: (
      <>
        <p>We are committed to complying with applicable accessibility laws and regulations, including:</p>
        <ul>
          <li>Americans with Disabilities Act (ADA)</li>
          <li>Section 508 of the Rehabilitation Act</li>
          <li>California Unruh Civil Rights Act</li>
          <li>Web Content Accessibility Guidelines (WCAG) 2.1</li>
        </ul>
      </>
    ),
  },
  {
    id: "response-time",
    title: "Response Time",
    content: (
      <p>
        We strive to respond to accessibility-related inquiries within 2 business days. For urgent accessibility
        needs, please call our office directly at{" "}
        <a href={`tel:${officeInfo.phoneE164}`}>{officeInfo.phone}</a>.
      </p>
    ),
  },
];

const Accessibility = () => (
  <LegalPage
    title="Accessibility Statement"
    crumbName="Accessibility"
    path="/accessibility"
    eyebrow="Accessibility"
    lead="Our commitment to providing equal access for all patients."
    meta={
      <>
        Last updated: <time dateTime={LAST_UPDATED_ISO}>{LAST_UPDATED_LABEL}</time>
      </>
    }
    sections={sections}
    contactTitle="Feedback and Assistance"
    contactRole="Accessibility Coordinator"
    contactIntro="We welcome feedback about the accessibility of our website and services. If you encounter any accessibility barriers or need assistance accessing information, please contact us:"
  />
);

export default Accessibility;
