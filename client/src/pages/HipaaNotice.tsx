import MetaTags from "@/components/common/MetaTags";
import { officeInfo } from "@/lib/data";

const HipaaNotice = () => {
  return (
    <>
      <MetaTags 
        title="HIPAA Notice | Christopher B. Wong, DDS"
        description="Learn about HIPAA rights and how Dr. Wong's dental practice protects health information privacy with policies for security and patient confidentiality."
      />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-[#F5F9FC] py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">HIPAA Notice of Privacy Practices</h1>
            <p className="text-lg text-gray-600">Effective Date: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg max-w-none">
            
            <h2>Your Rights Regarding Your Health Information</h2>
            <p>
              This notice describes how medical information about you may be used and disclosed and how you can get access to this information. Please review it carefully.
            </p>

            <h2>Our Commitment to Your Privacy</h2>
            <p>
              {officeInfo.name} is committed to protecting your health information. We are required by law to maintain the privacy of your protected health information (PHI) and to provide you with this notice of our legal duties and privacy practices.
            </p>

            <h2>How We May Use and Disclose Your Health Information</h2>
            
            <h3>Treatment</h3>
            <p>
              We may use your health information to provide you with dental treatment and services. For example, information obtained by a dentist, dental hygienist, or other member of your healthcare team will be recorded in your record and used to determine the course of treatment that should work best for you.
            </p>

            <h3>Payment</h3>
            <p>
              Your health information may be used to seek payment for treatment and services provided to you. For example, a bill may be sent to you or a third-party payer. The information on or accompanying the bill may include information that identifies you, as well as your diagnosis, procedures, and supplies used.
            </p>

            <h3>Healthcare Operations</h3>
            <p>
              We may use and disclose your health information for healthcare operations. These uses and disclosures are necessary to run the practice and make sure that all of our patients receive quality care. For example, we may use your health information to review our treatment and services and to evaluate the performance of our staff.
            </p>

            <h3>Other Uses and Disclosures</h3>
            <p>We may also use or disclose your health information for the following purposes:</p>
            <ul>
              <li><strong>Appointment reminders:</strong> We may contact you to provide appointment reminders</li>
              <li><strong>Treatment alternatives:</strong> We may tell you about or recommend possible treatment options or alternatives</li>
              <li><strong>Health-related benefits and services:</strong> We may tell you about health-related benefits or services that may be of interest to you</li>
              <li><strong>Business associates:</strong> We may disclose your health information to business associates that perform functions on our behalf</li>
              <li><strong>As required by law:</strong> We will disclose your health information when required to do so by federal, state, or local law</li>
            </ul>

            <h2>Your Individual Rights</h2>
            
            <h3>Right to Request Restrictions</h3>
            <p>
              You have the right to request a restriction or limitation on the health information we use or disclose about you for treatment, payment, or healthcare operations. We are not required to agree to your request, but if we do agree, we will comply with your request unless the information is needed to provide you emergency treatment.
            </p>

            <h3>Right to Request Confidential Communications</h3>
            <p>
              You have the right to request that we communicate with you about medical matters in a certain way or at a certain location. For example, you can ask that we only contact you at work or by mail.
            </p>

            <h3>Right to Inspect and Copy</h3>
            <p>
              You have the right to inspect and copy health information that may be used to make decisions about your care. To inspect and copy your health information, you must submit your request in writing. We may charge a fee for the costs of copying, mailing, or other supplies associated with your request.
            </p>

            <h3>Right to Amend</h3>
            <p>
              If you feel that health information we have about you is incorrect or incomplete, you may ask us to amend the information. You have the right to request an amendment for as long as the information is kept by or for our office.
            </p>

            <h3>Right to an Accounting</h3>
            <p>
              You have the right to request an "accounting of disclosures." This is a list of the disclosures we made of health information about you other than our own uses for treatment, payment, and healthcare operations.
            </p>

            <h3>Right to a Paper Copy</h3>
            <p>
              You have the right to obtain a paper copy of this notice from us upon request, even if you have agreed to receive the notice electronically.
            </p>

            <h2>Complaints</h2>
            <p>
              If you believe your privacy rights have been violated, you may file a complaint with our office or with the Secretary of the Department of Health and Human Services. To file a complaint with our office, contact our Privacy Officer. All complaints must be submitted in writing. You will not be penalized for filing a complaint.
            </p>

            <h2>Changes to This Notice</h2>
            <p>
              We reserve the right to change this notice and to make the revised or changed notice effective for health information we already have about you as well as any information we receive in the future. We will post a copy of the current notice in our office.
            </p>

            <h2>Contact Information</h2>
            <p>
              If you have any questions about this notice or need to exercise any of your rights described above, please contact our Privacy Officer:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p><strong>Privacy Officer</strong></p>
              <p><strong>{officeInfo.name}</strong></p>
              <p>{officeInfo.address.line1}</p>
              <p>{officeInfo.address.line2}</p>
              <p>Phone: {officeInfo.phone}</p>
              <p>Email: {officeInfo.email}</p>
            </div>

            <h2>Complaints to the Federal Government</h2>
            <p>
              You may also file a complaint with the U.S. Department of Health and Human Services:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p><strong>U.S. Department of Health and Human Services</strong></p>
              <p>Office for Civil Rights</p>
              <p>200 Independence Avenue, S.W.</p>
              <p>Washington, D.C. 20201</p>
              <p>Phone: 1-877-696-6775</p>
              <p>Website: www.hhs.gov/ocr/privacy/hipaa/complaints/</p>
            </div>

          </div>
        </section>
      </div>
    </>
  );
};

export default HipaaNotice;
