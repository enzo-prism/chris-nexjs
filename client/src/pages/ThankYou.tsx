import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import MetaTags from "@/components/common/MetaTags";

const ThankYou = () => {
  return (
    <>
      <MetaTags 
        title="Thank You - Appointment Scheduled | Christopher B. Wong, DDS"
        description="Thank you for scheduling your appointment with Dr. Wong's dental practice in Palo Alto. We look forward to providing exceptional care at your upcoming visit."
        robots="noindex, nofollow, noarchive"
      />
      
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          
          {/* Thank You Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You!
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Your appointment request has been submitted successfully.
          </p>
          
          <p className="text-gray-600 mb-8">
            Our team will contact you shortly to confirm your appointment details.
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-4">
            <Link href="/">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                Return to Homepage
              </Button>
            </Link>
            
            <Link href="/patient-resources">
              <Button variant="outline" className="w-full">
                View Patient Resources
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThankYou;
