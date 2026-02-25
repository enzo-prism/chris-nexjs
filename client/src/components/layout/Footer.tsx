import { Link } from "wouter";
import { Phone, MapPin, ExternalLink, Instagram } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { officeInfo } from "@/lib/data";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Footer link sections
  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "Dr. Wong" },
    { href: "/services", label: "Services" },
    { href: "/patient-resources", label: "Patient Resources" },
    { href: "/patient-stories", label: "Patient Stories" },
    { href: "/blog", label: "Blog" },
    { href: "/dentist-menlo-park", label: "Menlo Park Families" },
    { href: "/dentist-stanford", label: "Stanford Patients" },
    { href: "/dentist-mountain-view", label: "Mountain View Families" },
    { href: "/dentist-los-altos", label: "Los Altos Patients" },
    { href: "/dentist-los-altos-hills", label: "Los Altos Hills Patients" },
    { href: "/dentist-sunnyvale", label: "Sunnyvale Families" },
    { href: "/dentist-cupertino", label: "Cupertino Families" },
    { href: "/dentist-redwood-city", label: "Redwood City Patients" },
    { href: "/dentist-atherton", label: "Atherton Patients" },
    { href: "/dentist-redwood-shores", label: "Redwood Shores Patients" },
    { href: "/locations", label: "All Locations" },
    { href: "/contact", label: "Contact" }
  ];

  const services = [
    { href: "/services#preventive-dentistry", label: "Preventive Dentistry" },
    { href: "/invisalign", label: "Invisalign®" },
    { href: "/services#cosmetic-dentistry", label: "Cosmetic Dentistry" },
    { href: "/teeth-whitening-palo-alto", label: "Teeth Whitening" },
    { href: "/services#restorative-dentistry", label: "Restorative Dentistry" },
    { href: "/services#pediatric-dentistry", label: "Pediatric Dentistry" },
    { href: "/emergency-dental", label: "Emergency Dentist" }
  ];

  const legalLinks = [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/hipaa", label: "HIPAA Notice" },
    { href: "/accessibility", label: "Accessibility" }
  ];

  // Social media links
  const socialMedia = [
    { icon: <Instagram className="h-4 w-4" />, href: officeInfo.socialMedia.instagram, label: "Instagram", rel: "noopener noreferrer" }
  ];

  const businessUrl = "https://www.chriswongdds.com";

  return (
    <footer className="bg-primary bg-opacity-95 text-white">
      {/* Desktop footer - hidden on mobile */}
      <div className="hidden md:block py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {/* Practice Info */}
            <div itemScope itemType="https://schema.org/Dentist">
              <meta itemProp="url" content={businessUrl} />
              <h3 className="text-lg font-medium tracking-tight mb-4" itemProp="name">Dr. Christopher B. Wong</h3>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">
                Comprehensive dental care in a comfortable, state-of-the-art environment.
              </p>
              <div className="space-y-4">
                <p className="flex items-center text-sm text-white/90">
                  <Phone className="h-4 w-4 mr-3 flex-shrink-0 text-white/70" />
                  <a
                    href={`tel:${officeInfo.phoneE164}`}
                    className="hover:text-white transition-colors"
                    itemProp="telephone"
                  >
                    {officeInfo.phone}
                  </a>
                </p>

                <div className="flex items-start text-sm text-white/90">
                  <MapPin className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0 text-white/70" />
                  <address
                    className="not-italic"
                    itemProp="address"
                    itemScope
                    itemType="https://schema.org/PostalAddress"
                  >
                    <span itemProp="streetAddress">{officeInfo.address.line1}</span>
                    <br />
                    <span>
                      <span itemProp="addressLocality">{officeInfo.address.city}</span>,{" "}
                      <span itemProp="addressRegion">{officeInfo.address.region}</span>{" "}
                      <span itemProp="postalCode">{officeInfo.address.postalCode}</span>
                    </span>
                    <meta itemProp="addressCountry" content={officeInfo.address.country} />
                  </address>
                </div>
                <div className="flex space-x-3 mt-3">
                  {socialMedia.map((social, index) => (
                    <a 
                      key={index} 
                      href={social.href} 
                      className="text-white/80 hover:text-white transition-colors bg-white/10 p-2 rounded-full"
                      aria-label={social.label}
                      rel="noopener noreferrer"
                      target="_blank"
                      itemProp="sameAs"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-sm uppercase tracking-wider mb-4 font-medium">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index} className="text-sm text-white/80">
                    <Link href={link.href}>
                      <span className="hover:text-white transition-colors cursor-pointer inline-flex items-center">
                        {link.label}
                        <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Services */}
            <div>
              <h3 className="text-sm uppercase tracking-wider mb-4 font-medium">Services</h3>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index} className="text-sm text-white/80">
                    <Link href={service.href}>
                      <span className="hover:text-white transition-colors cursor-pointer">
                        {service.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-white/20" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col items-center md:items-start">
              <p className="text-xs text-white/70">&copy; {currentYear} Christopher B. Wong, DDS. All rights reserved.</p>
              <p className="text-xs text-white/50 mt-1">
                Invisalign®, the Invisalign® logo, iTero™, and Vivera™ are trademarks of Align Technology, Inc. and are registered in the U.S. and other countries.
              </p>
              <p className="text-xs text-white/50 mt-1">
                website built by{" "}
                <a 
                  href="https://www.design-prism.com/case-studies/dr-christopher-wong?utm_source=drwong&utm_medium=referral&utm_campaign=drwong_2025-07" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white/70 transition-colors underline underline-offset-2"
                >
                  Prism in silicon valley
                </a>
              </p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {legalLinks.map((link, index) => (
                <Link key={index} href={link.href}>
                  <span className="text-xs text-white/70 hover:text-white transition-colors cursor-pointer">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile footer - visible only on mobile */}
      <div className="md:hidden py-8">
        <div className="max-w-md mx-auto px-5">
          <div className="text-center mb-8" itemScope itemType="https://schema.org/Dentist">
            <meta itemProp="url" content={businessUrl} />
            <h3 className="text-lg font-medium mb-2" itemProp="name">Dr. Christopher B. Wong</h3>
            <p className="text-sm text-white/80 mb-4">Comprehensive dental care in Palo Alto</p>
            
            <div className="flex justify-center space-x-3 mb-4">
              {socialMedia.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href} 
                  className="text-white/80 hover:text-white transition-colors bg-white/10 p-2 rounded-full"
                  aria-label={social.label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* Contact info for mobile */}
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <p className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-3 flex-shrink-0 text-white/70" />
                <a
                  href={`tel:${officeInfo.phoneE164}`}
                  className="hover:text-white transition-colors"
                  itemProp="telephone"
                >
                  {officeInfo.phone}
                </a>
              </p>

              <div className="flex items-start text-sm">
                <MapPin className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0 text-white/70" />
                <address
                  className="not-italic"
                  itemProp="address"
                  itemScope
                  itemType="https://schema.org/PostalAddress"
                >
                  <span itemProp="streetAddress">{officeInfo.address.line1}</span>
                  <br />
                  <span>
                    <span itemProp="addressLocality">{officeInfo.address.city}</span>,{" "}
                    <span itemProp="addressRegion">{officeInfo.address.region}</span>{" "}
                    <span itemProp="postalCode">{officeInfo.address.postalCode}</span>
                  </span>
                  <meta itemProp="addressCountry" content={officeInfo.address.country} />
                </address>
              </div>
            </div>
          </div>
          
          {/* Accordion menu for mobile */}
          <Accordion type="single" collapsible className="mb-8">
            <AccordionItem value="quick-links" className="border-white/20">
              <AccordionTrigger className="text-sm py-3 text-white hover:text-white/90">
                Quick Links
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 py-2 pl-2">
                  {quickLinks.map((link, index) => (
                    <li key={index} className="text-sm text-white/80">
                      <Link href={link.href}>
                        <span className="hover:text-white transition-colors cursor-pointer block py-1">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="services" className="border-white/20">
              <AccordionTrigger className="text-sm py-3 text-white hover:text-white/90">
                Our Services
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 py-2 pl-2">
                  {services.map((service, index) => (
                    <li key={index} className="text-sm text-white/80">
                      <Link href={service.href}>
                        <span className="hover:text-white transition-colors cursor-pointer block py-1">
                          {service.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Separator className="bg-white/20 mb-6" />
          
          <div className="text-center">
            <p className="text-xs text-white/70 mb-2">&copy; {currentYear} Christopher B. Wong, DDS. All rights reserved.</p>
            <p className="text-xs text-white/50 mb-2">
              Invisalign®, the Invisalign® logo, iTero™, and Vivera™ are trademarks of Align Technology, Inc. and are registered in the U.S. and other countries.
            </p>
            <p className="text-xs text-white/50 mb-4">
              website built by{" "}
              <a 
                href="https://www.design-prism.com/case-studies/dr-christopher-wong?utm_source=drwong&utm_medium=referral&utm_campaign=drwong_2025-07" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white/70 transition-colors underline underline-offset-2"
              >
                Prism in silicon valley
              </a>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {legalLinks.map((link, index) => (
                <Link key={index} href={link.href}>
                  <span className="text-xs text-white/70 hover:text-white transition-colors cursor-pointer">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
