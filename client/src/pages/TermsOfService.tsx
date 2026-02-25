import MetaTags from "@/components/common/MetaTags";
import { officeInfo } from "@/lib/data";

const TermsOfService = () => {
  return (
    <>
      <MetaTags 
        title="Terms of Service | Christopher B. Wong, DDS"
        description="Read the terms and conditions for using Dr. Wong's dental practice website and the guidelines for receiving dental services in our Palo Alto office."
      />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-[#F5F9FC] py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg max-w-none">
            
            <h2>Agreement to Terms</h2>
            <p>
              By accessing and using the website of {officeInfo.name} and receiving dental services at our practice, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>

            <h2>Use of Website</h2>
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

            <h2>Patient Responsibilities</h2>
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
              <li>Ask questions if you don't understand any aspect of your treatment</li>
            </ul>

            <h2>Practice Policies</h2>
            <h3>Cancellation Policy</h3>
            <p>
              We require at least 24 hours advance notice for appointment cancellations. Failure to provide adequate notice or repeated no-shows may result in a cancellation fee.
            </p>

            <h3>Payment Policy</h3>
            <ul>
              <li>Payment is due at the time of service unless prior arrangements have been made</li>
              <li>We accept cash, credit cards, and most dental insurance plans</li>
              <li>Patients are responsible for understanding their insurance benefits and coverage</li>
              <li>Outstanding balances may be subject to interest charges</li>
            </ul>

            <h3>Insurance</h3>
            <p>
              While we participate with many insurance plans, you are ultimately responsible for payment of services. We will assist with insurance claims as a courtesy, but insurance payment is between you and your insurance company.
            </p>

            <h2>Treatment and Consent</h2>
            <ul>
              <li>All treatment recommendations are based on our professional judgment</li>
              <li>You have the right to accept or decline any recommended treatment</li>
              <li>Treatment outcomes cannot be guaranteed</li>
              <li>You are responsible for following all post-treatment care instructions</li>
              <li>Emergency treatment may be provided without prior consultation</li>
            </ul>

            <h2>Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, {officeInfo.name} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or services.
            </p>

            <h2>Intellectual Property</h2>
            <p>
              All content on this website, including text, images, logos, and design elements, is the property of {officeInfo.name} and is protected by copyright and trademark laws. You may not reproduce, distribute, or use any content without our written permission.
            </p>

            <h2>Privacy and Confidentiality</h2>
            <p>
              We are committed to protecting your privacy and maintaining the confidentiality of your personal and medical information in accordance with HIPAA regulations. Please review our Privacy Policy for detailed information about our privacy practices.
            </p>

            <h2>Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services constitutes acceptance of the modified terms.
            </p>

            <h2>Governing Law</h2>
            <p>
              These Terms of Service are governed by the laws of the State of California. Any disputes arising from these terms will be resolved in the appropriate courts of Santa Clara County, California.
            </p>

            <h2>Contact Information</h2>
            <p>
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p><strong>{officeInfo.name}</strong></p>
              <p>{officeInfo.address.line1}</p>
              <p>{officeInfo.address.line2}</p>
              <p>Phone: {officeInfo.phone}</p>
              <p>Email: {officeInfo.email}</p>
            </div>

          </div>
        </section>
      </div>
    </>
  );
};

export default TermsOfService;
