import { Clock, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import OptimizedImage from "@/components/seo/OptimizedImage";
import { officeInfo } from "@/lib/data";
import { cn } from "@/lib/utils";

type OfficeVisitSectionProps = {
  readonly imageSrc: string;
  readonly imageAlt: string;
  readonly className?: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly showEmail?: boolean;
  readonly showDirectionsButton?: boolean;
  readonly withSchema?: boolean;
  readonly schemaUrl?: string;
  readonly schemaName?: string;
  readonly schemaImage?: string;
};

export default function OfficeVisitSection({
  imageSrc,
  imageAlt,
  className,
  title = "Visit Our Office",
  subtitle = "Come see our state-of-the-art facilities in Palo Alto.",
  showEmail = false,
  showDirectionsButton = false,
  withSchema = false,
  schemaUrl,
  schemaName,
  schemaImage,
}: OfficeVisitSectionProps): JSX.Element {
  const wrapperSchemaProps = withSchema
    ? {
        itemScope: true,
        itemType: "https://schema.org/Dentist",
      }
    : {};

  const addressSchemaProps = withSchema
    ? {
        itemProp: "address",
        itemScope: true,
        itemType: "https://schema.org/PostalAddress",
      }
    : {};

  return (
    <section className={cn("bg-white py-12", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-2xl font-bold font-heading text-[#333333] md:text-3xl">
            {title}
          </h2>
          <p className="mx-auto max-w-2xl text-[#333333]">{subtitle}</p>
          <div className="mx-auto mt-4 h-1 w-24 bg-primary" />
        </div>

        <div
          className="grid items-center gap-8 md:grid-cols-2"
          {...wrapperSchemaProps}
        >
          {withSchema && schemaUrl ? <meta itemProp="url" content={schemaUrl} /> : null}
          {withSchema && schemaName ? (
            <meta itemProp="name" content={schemaName} />
          ) : null}
          {withSchema && schemaImage ? (
            <meta itemProp="image" content={schemaImage} />
          ) : null}

          <div className="overflow-hidden rounded-xl shadow-md">
            <OptimizedImage
              src={imageSrc}
              alt={imageAlt}
              className="h-64 w-full object-cover md:h-80"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-start">
              <MapPin className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h3 className="mb-1 font-semibold text-[#333333]">Office Address</h3>
                <a
                  href={officeInfo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#333333] transition-colors hover:text-primary"
                >
                  <address className="not-italic" {...addressSchemaProps}>
                    <span itemProp={withSchema ? "streetAddress" : undefined}>
                      {officeInfo.address.line1}
                    </span>
                    <br />
                    <span>
                      <span itemProp={withSchema ? "addressLocality" : undefined}>
                        {officeInfo.address.city}
                      </span>
                      {", "}
                      <span itemProp={withSchema ? "addressRegion" : undefined}>
                        {officeInfo.address.region}
                      </span>{" "}
                      <span itemProp={withSchema ? "postalCode" : undefined}>
                        {officeInfo.address.postalCode}
                      </span>
                    </span>
                    {withSchema ? (
                      <meta
                        itemProp="addressCountry"
                        content={officeInfo.address.country}
                      />
                    ) : null}
                  </address>
                </a>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h3 className="mb-1 font-semibold text-[#333333]">Office Hours</h3>
                <p className="text-[#333333]">
                  Monday - Thursday: {officeInfo.hours.monday}
                  <br />
                  Friday: {officeInfo.hours.friday}
                  <br />
                  Saturday - Sunday: {officeInfo.hours.saturday}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h3 className="mb-1 font-semibold text-[#333333]">Phone</h3>
                <a
                  href={`tel:${officeInfo.phoneE164}`}
                  className="text-[#333333] transition-colors hover:text-primary"
                  itemProp={withSchema ? "telephone" : undefined}
                >
                  {officeInfo.phone}
                </a>
              </div>
            </div>

            {showEmail ? (
              <div className="flex items-start">
                <Mail className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h3 className="mb-1 font-semibold text-[#333333]">Email</h3>
                  <a
                    href={`mailto:${officeInfo.email}`}
                    className="text-[#333333] transition-colors hover:text-primary"
                  >
                    {officeInfo.email}
                  </a>
                </div>
              </div>
            ) : null}

            {showDirectionsButton ? (
              <a
                href={officeInfo.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Open in Google Maps
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
