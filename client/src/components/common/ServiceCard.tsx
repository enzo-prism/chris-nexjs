
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import ButtonLink from "@/components/common/ButtonLink";
import OptimizedImage from "@/components/seo/OptimizedImage";

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

  const getBookingIntent = (slug: string): string => {
    switch (slug) {
      case "invisalign":
        return "invisalign";
      case "emergency-dental":
        return "emergency";
      case "cosmetic-dentistry":
        return "cosmetic";
      case "dental-implants":
        return "implants";
      case "zoom-whitening":
        return "whitening";
      case "restorative-dentistry":
        return "restorative";
      case "pediatric-dentistry":
        return "pediatric";
      default:
        return "preventive";
    }
  };

  return (
    <Card
      className="ui-card-interactive group flex h-full w-full flex-col overflow-hidden rounded-3xl border"
      id={service.slug}
    >
      {service.image ? (
        <div
          className={`relative min-h-[180px] w-full overflow-hidden rounded-b-[48px] bg-slate-100 ${getServiceGradient(service.title)}`}
        >
          <OptimizedImage
            src={service.image}
            alt=""
            width={720}
            height={480}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="absolute inset-0 h-full w-full"
            objectPosition="center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent"
            aria-hidden="true"
          />
          {service.slug === "preventive-dentistry" ? (
            <Badge className="absolute left-5 top-5 bg-white/95 text-primary shadow-sm">
              Popular
            </Badge>
          ) : null}
        </div>
      ) : (
        <div
          className={`h-3 w-full ${getServiceGradient(service.title)}`}
          aria-hidden="true"
        />
      )}

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
            className="w-full"
            aria-label={`Learn about ${service.title}`}
          >
            View service
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </ButtonLink>
          <ButtonLink
            href={`/schedule?intent=${getBookingIntent(service.slug)}&source=service-card#appointment`}
            className="w-full"
            aria-label={`Request an appointment for ${service.title}`}
          >
            Request appointment
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
