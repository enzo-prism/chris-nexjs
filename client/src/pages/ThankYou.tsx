"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import MetaTags from "@/components/common/MetaTags";
import { officeInfo } from "@shared/officeInfo";

const ThankYou = () => {
  return (
    <>
      <MetaTags
        title="Thank You | Christopher B. Wong, DDS"
        description="Thank you for reaching out to our Palo Alto dental practice. Our team will get back to you within one business day."
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
            Your message has been received.
          </p>

          <p className="text-gray-600 mb-8">
            Our team will get back to you within one business day. If anything
            is urgent, call us at{" "}
            <a
              href={`tel:${officeInfo.phoneE164}`}
              className="font-medium text-primary"
            >
              {officeInfo.phone}
            </a>
            .
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
