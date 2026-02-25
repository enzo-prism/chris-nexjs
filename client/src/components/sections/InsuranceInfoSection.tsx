import { CheckCircle2, Phone } from "lucide-react";
import { officeInfo, insuranceProviders } from "@/lib/data";
import { cn } from "@/lib/utils";

type InsuranceInfoSectionProps = {
  readonly className?: string;
  readonly title?: string;
  readonly subtitle?: string;
};

export default function InsuranceInfoSection({
  className,
  title = "Insurance Information",
  subtitle = "We work with most major insurance providers. Contact us to verify your coverage.",
}: InsuranceInfoSectionProps): JSX.Element {
  return (
    <section className={cn("bg-[#F5F9FC] py-16", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold font-heading text-[#333333]">
            {title}
          </h2>
          <p className="mx-auto max-w-3xl text-[#333333]">{subtitle}</p>
          <div className="mx-auto mt-4 h-1 w-24 bg-primary" />
        </div>

        <div className="rounded-xl bg-white p-8 shadow-md">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-xl font-bold font-heading text-[#333333]">
                Accepted Insurance Plans
              </h3>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {insuranceProviders.map((provider) => (
                  <li key={provider} className="flex items-center">
                    <CheckCircle2
                      className="mr-3 h-5 w-5 text-primary"
                      aria-hidden="true"
                    />
                    <span>{provider}</span>
                  </li>
                ))}
                <li className="flex items-center">
                  <CheckCircle2
                    className="mr-3 h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  <span>And more PPO plans</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xl font-bold font-heading text-[#333333]">
                Insurance Questions?
              </h3>
              <p className="mb-4 text-[#333333]">
                Our team can help verify your benefits before your visit and walk
                through expected out-of-pocket costs.
              </p>
              <p className="mb-4 text-[#333333]">
                If you do not have insurance, ask about flexible payment options
                and our in-office dental plan.
              </p>
              <p className="flex items-center text-[#333333]">
                <Phone className="mr-2 h-5 w-5 text-primary" aria-hidden="true" />
                <a
                  href={`tel:${officeInfo.phoneE164}`}
                  className="font-semibold hover:text-primary"
                >
                  Call us at {officeInfo.phone}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
