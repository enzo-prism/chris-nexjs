import { CheckCircle, Phone } from "lucide-react";
import AppointmentForm from "@/components/forms/AppointmentForm";
import { officeInfo } from "@/lib/data";
import { motion } from "framer-motion";

const AppointmentSection = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-[#F5F9FC]" id="appointments">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Highlighted Scheduling Header */}
        <motion.div 
          className="text-center mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeIn}
        >
          <div className="inline-block px-6 py-2 bg-primary text-white rounded-full mb-4">
            <p className="text-sm font-medium">Easy Online Scheduling</p>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading mb-3">
            Book Your Dental Visit Today
          </h2>
          <p className="text-[#333333] max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
            Send a quick request and our team will respond within one business day.
          </p>
        </motion.div>
        
        {/* Enhanced Appointment Card */}
        <motion.div 
          className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col lg:flex-row">
            {/* Left side - info section */}
            <div className="lg:w-2/5 bg-primary p-6 sm:p-8 lg:p-12 text-white">
              <h2 className="text-xl sm:text-2xl font-bold font-heading mb-6">Why Schedule with Us?</h2>
              
              {/* Enhanced Benefits list */}
              <div className="mb-8 space-y-5">
                <div className="flex items-start">
                  <div className="bg-white p-2 rounded-full mr-4">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg">HIPAA-Compliant Security</h4>
                    <p className="text-sm text-blue-100">Your personal information is always protected</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-2 rounded-full mr-4">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg">Same-Day Appointments</h4>
                    <p className="text-sm text-blue-100">Available for urgent dental needs</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-2 rounded-full mr-4">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg">Easy Rescheduling</h4>
                    <p className="text-sm text-blue-100">Life happens - we make changes simple</p>
                  </div>
                </div>
              </div>
              
              {/* Office hours card */}
              <div className="p-5 bg-blue-900 bg-opacity-50 rounded-lg mb-6">
                <h3 className="font-bold mb-3 text-sm sm:text-base">Office Hours</h3>
                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div className="font-medium">Monday - Thursday</div>
                  <div>{officeInfo.hours.monday}</div>
                  <div className="font-medium">Friday</div>
                  <div>{officeInfo.hours.friday}</div>
                  <div className="font-medium">Saturday - Sunday</div>
                  <div>Closed</div>
                </div>
              </div>
              
              {/* Contact options */}
              <div className="flex items-center">
                <a
                  href={`tel:${officeInfo.phoneE164}`}
                  className="flex items-center text-base sm:text-lg font-bold hover:text-blue-200 transition-colors"
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span>{officeInfo.phone}</span>
                </a>
              </div>
            </div>
            
            {/* Right side - form section */}
            <div className="lg:w-3/5 p-6 sm:p-8 lg:p-12">
              <div className="max-w-lg mx-auto">
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-[#333333] mb-2 sm:mb-4">Request an Appointment</h3>
                <p className="text-[#333333] mb-6 text-sm sm:text-base">
                  Complete this simple form and we&apos;ll confirm your appointment by call or text within one business day.
                </p>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  This should take about 30 seconds.
                </p>
                
                {/* Built-in scheduling form */}
                <AppointmentForm />
                
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Need assistance? Call us directly at {officeInfo.phone}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AppointmentSection;
