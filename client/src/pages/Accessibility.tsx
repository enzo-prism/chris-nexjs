"use client";

import MetaTags from "@/components/common/MetaTags";
import { officeInfo } from "@/lib/data";

const Accessibility = () => {
  return (
    <>
      <MetaTags 
        title="Accessibility Statement | Christopher B. Wong, DDS"
        description="Learn about Dr. Wong's commitment to web accessibility and providing equal access to dental care for all patients, along with efforts to improve our site."
      />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-[#F5F9FC] py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Accessibility Statement</h1>
            <p className="text-lg text-gray-600">Our commitment to providing equal access for all patients</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg max-w-none">
            
            <h2>Our Commitment to Accessibility</h2>
            <p>
              At {officeInfo.name}, we are committed to ensuring that our website and dental services are accessible to everyone, including individuals with disabilities. We believe that everyone deserves equal access to quality dental care and information about our services.
            </p>

            <h2>Web Accessibility Standards</h2>
            <p>
              We strive to make our website accessible in accordance with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These guidelines help make web content more accessible to people with disabilities, including:
            </p>
            <ul>
              <li>Visual impairments (blindness, low vision, color blindness)</li>
              <li>Hearing impairments (deafness, hearing loss)</li>
              <li>Motor disabilities (difficulty using a mouse, slow response time)</li>
              <li>Cognitive disabilities (learning disabilities, memory limitations)</li>
            </ul>

            <h2>Accessibility Features</h2>
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
            </ul>

            <h2>Physical Office Accessibility</h2>
            <p>
              Our dental office is designed to be accessible to patients with disabilities:
            </p>
            <ul>
              <li>ADA-compliant wheelchair accessibility</li>
              <li>Accessible parking spaces</li>
              <li>Wide doorways and hallways</li>
              <li>Accessible restroom facilities</li>
              <li>Lowered reception counter areas</li>
              <li>Clear pathways throughout the office</li>
              <li>Accessible dental chairs with transfer assistance available</li>
            </ul>

            <h2>Communication Accommodations</h2>
            <p>
              We provide various communication accommodations to ensure all patients can effectively communicate with our team:
            </p>
            <ul>
              <li>Large print materials upon request</li>
              <li>Patient forms available in alternative formats</li>
              <li>Sign language interpreter services (with advance notice)</li>
              <li>Written communication for patients with hearing impairments</li>
              <li>Extended appointment times when needed</li>
              <li>Clear verbal explanations of procedures</li>
            </ul>

            <h2>Assistive Technology Support</h2>
            <p>
              Our website is designed to work with various assistive technologies, including:
            </p>
            <ul>
              <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
              <li>Voice recognition software</li>
              <li>Screen magnification tools</li>
              <li>Alternative keyboards and pointing devices</li>
              <li>Switch navigation devices</li>
            </ul>

            <h2>Ongoing Improvements</h2>
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

            <h2>Third-Party Content</h2>
            <p>
              While we strive to ensure that all content on our website is accessible, some third-party content may not meet the same accessibility standards. We work with our vendors and partners to improve accessibility whenever possible.
            </p>

            <h2>Feedback and Assistance</h2>
            <p>
              We welcome feedback about the accessibility of our website and services. If you encounter any accessibility barriers or need assistance accessing information, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p><strong>Accessibility Coordinator</strong></p>
              <p><strong>{officeInfo.name}</strong></p>
              <p>{officeInfo.address.line1}</p>
              <p>{officeInfo.address.line2}</p>
              <p>Phone: {officeInfo.phone}</p>
              <p>Email: {officeInfo.email}</p>
            </div>

            <h2>Alternative Access Methods</h2>
            <p>
              If you are unable to access information on our website, we can provide the same information through alternative methods:
            </p>
            <ul>
              <li>Phone consultation about our services</li>
              <li>Printed materials mailed to your address</li>
              <li>In-person discussion during your visit</li>
              <li>Email communication with detailed information</li>
            </ul>

            <h2>Legal Compliance</h2>
            <p>
              We are committed to complying with applicable accessibility laws and regulations, including:
            </p>
            <ul>
              <li>Americans with Disabilities Act (ADA)</li>
              <li>Section 508 of the Rehabilitation Act</li>
              <li>California Unruh Civil Rights Act</li>
              <li>Web Content Accessibility Guidelines (WCAG) 2.1</li>
            </ul>

            <h2>Response Time</h2>
            <p>
              We strive to respond to accessibility-related inquiries within 2 business days. For urgent accessibility needs, please call our office directly at {officeInfo.phone}.
            </p>

            <p className="text-sm text-gray-600 mt-8">
              This accessibility statement was last updated on {new Date().toLocaleDateString()}.
            </p>

          </div>
        </section>
      </div>
    </>
  );
};

export default Accessibility;
