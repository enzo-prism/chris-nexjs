
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import ButtonLink from "@/components/common/ButtonLink";

import { Service } from "@shared/schema";
import { getServiceGradient } from "@/lib/serviceGradients";

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const getDetailPath = (slug: string): string => {
    switch (slug) {
      case "invisalign":
        return "/invisalign";
      case "emergency-dental":
        return "/emergency-dental";
      case "cosmetic-dentistry":
        return "/dental-veneers";
      case "dental-implants":
        return "/dental-implants";
      case "zoom-whitening":
        return "/zoom-whitening";
      case "preventive-dentistry":
        return "/preventive-dentistry";
      case "restorative-dentistry":
        return "/restorative-dentistry";
      case "pediatric-dentistry":
        return "/pediatric-dentistry";
      default:
        return `/services#${slug}`;
    }
  };

  // Custom CTA text based on service type
  const getCtaText = (serviceTitle: string): string => {
    switch(serviceTitle) {
      case "Preventive Dentistry":
        return "Schedule Your Checkup";
      case "Cosmetic Dentistry":
        return "Transform Your Smile";
      case "Restorative Dentistry":
        return "Restore Your Teeth";
      case "Pediatric Dentistry":
        return "Book a Kid's Visit";
      case "Orthodontics":
        return "Start Your Alignment";
      case "Emergency Dental Care":
        return "Get Urgent Care";
      default:
        return "Book Your Appointment";
    }
  };

  const getDetailLabel = (slug: string): string => {
    if (slug === "invisalign") {
      return "Invisalign in Palo Alto";
    }
    return "View Details";
  };

  return (
    <Card
      className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      id={service.slug}
    >
      <div
        className={`relative flex min-h-[140px] w-full items-start justify-between rounded-b-[48px] bg-slate-100 ${getServiceGradient(service.title)} px-6 py-5`}
      >
        {service.slug === "preventive-dentistry" && (
          <Badge className="bg-white/90 text-primary shadow-sm">
            Popular
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 p-6 md:p-7">
        <div>
          <h3 className="text-xl font-semibold leading-tight text-slate-900 transition-colors group-hover:text-primary">
            {service.title}
          </h3>
          <p className="mt-3 text-sm text-slate-600 md:text-base">
            {service.description}
          </p>
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0 md:px-7 md:pb-7">
        <div className="grid w-full gap-3">
          <ButtonLink
            href={getDetailPath(service.slug)}
            variant="outline"
            className="w-full border-primary text-primary transition-colors hover:bg-primary/5"
          >
            {getDetailLabel(service.slug)}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </ButtonLink>
          <ButtonLink
            href="/schedule#appointment"
            className="w-full bg-primary text-white transition-colors hover:bg-primary/90"
          >
            {getCtaText(service.title)}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
