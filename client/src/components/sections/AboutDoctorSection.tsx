import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { drWongImages } from '@/lib/imageUrls';
import OptimizedImage from '@/components/seo/OptimizedImage';

const AboutDoctorSection: React.FC = () => {
  return (
    <section id="about-doctor" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            About Dr. Christopher B. Wong, DDS
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>
        
        <div className="md:flex items-center">
          <div className="md:w-1/3 mb-8 md:mb-0">
            <OptimizedImage
              src={drWongImages.drWongPortrait1}
              alt="Dr. Christopher B. Wong, DDS portrait"
              className="w-full max-w-sm aspect-[4/5] object-cover rounded-lg shadow-xl mx-auto"
            />
            <div className="text-center mt-4">
              <h3 className="font-bold text-lg">Dr. Christopher B. Wong, DDS</h3>
              <p className="text-primary font-medium">Lead Dentist</p>
            </div>
          </div>
          <div className="md:w-2/3 md:pl-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Conservative Dental Care You Can Trust</h3>
            <p className="text-gray-700 mb-4">
              Dr Christopher Wong was born and raised in Sacramento and earned his bachelor's degree in Biology from UC Davis. 
              He graduated from the prestigious University of the Pacific Arthur A. Dugoni School of Dentistry in San Francisco in 2018.
              He is passionate about delivering high-quality care using conservative dentistry to help patients achieve healthy, 
              functional, and brilliant smiles.
            </p>
            <p className="text-gray-700 mb-6">
              Dr. Wong practices ethical and non-invasive dentistry with special interests in{" "}
              <Link href="/invisalign" className="text-primary font-semibold hover:underline">
                Invisalign in Palo Alto
              </Link>
              ,{" "}
              <Link href="/dental-implants" className="text-primary font-semibold hover:underline">
                dental implants
              </Link>
              , and restorative care. He focuses on prevention and early detection, helping patients retain their natural tooth
              structure while maintaining long-term oral health.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mt-1 mr-2" />
                <span>University of the Pacific School of Dentistry</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mt-1 mr-2" />
                <span>American Dental Association</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mt-1 mr-2" />
                <span>California Dental Association</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mt-1 mr-2" />
                <span>Santa Clara County Dental Society</span>
              </div>
            </div>
            
            <div className="mt-8">
              <Link href="/about">
                <Button className="bg-primary text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700">
                  Meet Dr. Christopher Wong
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutDoctorSection;
