import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { officeInfo } from "@/lib/data";
import { motion } from "framer-motion";

const OfficeInformationSection = () => {
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  const contactCards = [
    {
      icon: <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />,
      title: "Our Location",
      content: (
        <>
          <p className="text-[#333333] text-sm sm:text-base mb-2">{officeInfo.address.line1}<br/>{officeInfo.address.line2}</p>
          <a
            href={officeInfo.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary text-sm sm:text-base hover:underline"
          >
            Get Directions
            <ExternalLink className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
          </a>
        </>
      )
    },
    {
      icon: <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />,
      title: "Phone",
      content: (
        <p className="text-[#333333] text-sm sm:text-base">
          <a
            href={`tel:${officeInfo.phoneE164}`}
            className="hover:text-primary transition-colors"
          >
            {officeInfo.phone}
          </a>
        </p>
      )
    },

    {
      icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />,
      title: "Office Hours",
      content: (
        <p className="text-[#333333] text-xs sm:text-sm">
          Mon-Thu: {officeInfo.hours.monday}<br/>
          Fri: {officeInfo.hours.friday}<br/>
          Sat-Sun: Closed
        </p>
      )
    }
  ];

  return (
    <section className="py-10 sm:py-16" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#333333] mb-3">
            Contact Us
          </h2>
          <p className="text-[#333333] max-w-3xl mx-auto text-sm sm:text-base">
            Have questions or need assistance? Reach out to our friendly team using any of the methods below.
          </p>
          <div className="w-16 sm:w-24 h-1 bg-primary mx-auto mt-4"></div>
        </motion.div>
        
        {/* Contact cards - responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {contactCards.map((card, index) => (
            <motion.div 
              key={index}
              className="bg-white p-5 sm:p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300"
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={cardVariants}
            >
              <div className="rounded-full bg-primary bg-opacity-10 p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                {card.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-heading text-[#333333] mb-2">{card.title}</h3>
              {card.content}
            </motion.div>
          ))}
        </div>
        
        {/* Map - added as a responsive element */}
        <div className="mt-10 sm:mt-16 rounded-lg overflow-hidden shadow-lg h-64 sm:h-80 lg:h-96">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3168.371118386933!2d-122.14976869999995!3d37.44884729999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fbb3c116e86ef%3A0xebbf1ba97de2f679!2s409%20Cambridge%20Ave%2C%20Palo%20Alto%2C%20CA%2094306!5e0!3m2!1sen!2sus!4v1713357822024!5m2!1sen!2sus" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Dr. Wong's Dental Practice location"
            className="w-full h-full"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default OfficeInformationSection;
