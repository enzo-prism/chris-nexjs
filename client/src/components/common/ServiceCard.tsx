import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import ButtonLink from "@/components/common/ButtonLink";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getServiceGradient } from "@/lib/serviceGradients";
import type { Service } from "@shared/schema";

interface ServiceCardProps {
  readonly service: Service;
  readonly visual?: ReactNode;
}

const detailPaths: Readonly<Record<string, string>> = {
  invisalign: "/invisalign",
  "emergency-dental": "/emergency-dental",
  "cosmetic-dentistry": "/dental-veneers",
  "dental-implants": "/dental-implants",
  "zoom-whitening": "/zoom-whitening",
  "preventive-dentistry": "/preventive-dentistry",
  "restorative-dentistry": "/restorative-dentistry",
  "pediatric-dentistry": "/pediatric-dentistry",
};

const bookingIntents: Readonly<Record<string, string>> = {
  invisalign: "invisalign",
  "emergency-dental": "emergency",
  "cosmetic-dentistry": "cosmetic",
  "dental-implants": "implants",
  "zoom-whitening": "whitening",
  "restorative-dentistry": "restorative",
  "pediatric-dentistry": "pediatric",
};

const getDetailPath = (slug: string): string =>
  detailPaths[slug] ?? `/services#${slug}`;

const getBookingIntent = (slug: string): string =>
  bookingIntents[slug] ?? "preventive";

const ServiceCard = ({ service, visual }: ServiceCardProps) => {
  const displayTitle =
    service.slug === "pediatric-dentistry"
      ? "Children’s Dentistry"
      : service.title;
  return (
    <Card
      className="ui-card-interactive group flex h-full w-full flex-col overflow-hidden rounded-3xl border"
      id={service.slug}
    >
      {visual ? (
        <div className="px-6 pb-0 pt-6 md:px-7 md:pt-7">
          {visual}
        </div>
      ) : service.image ? (
        <div
          className={`relative overflow-hidden bg-slate-100 ${getServiceGradient(service.title)}`}
        >
          <Image
            src={service.image}
            alt=""
            width={720}
            height={480}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="aspect-[3/2] h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.015] motion-reduce:transform-none motion-reduce:transition-none"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent"
            aria-hidden="true"
          />
        </div>
      ) : (
        <div
          className={`h-2 w-full ${getServiceGradient(service.title)}`}
          aria-hidden="true"
        />
      )}

      <CardContent
        className={`flex flex-1 flex-col p-6 md:p-7 ${
          visual ? "pb-5 pt-5 md:pb-6 md:pt-6" : ""
        }`}
      >
        <h3 className="text-xl font-semibold leading-snug text-slate-950 transition-colors group-hover:text-primary">
          {displayTitle}
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base md:leading-7">
          {service.description}
        </p>
      </CardContent>

      <CardFooter className="grid gap-3 px-6 pb-6 pt-0 md:px-7 md:pb-7">
        <ButtonLink
          href={getDetailPath(service.slug)}
          variant="outline"
          className="min-h-11 w-full rounded-xl font-semibold"
          aria-label={`Learn about ${displayTitle}`}
        >
          Explore this service
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ButtonLink>
        <ButtonLink
          href={`/schedule?intent=${getBookingIntent(service.slug)}&source=service-card#appointment`}
          className="min-h-11 w-full rounded-xl font-semibold"
          aria-label={`Request an appointment for ${displayTitle}`}
        >
          Request an appointment
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ButtonLink>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
