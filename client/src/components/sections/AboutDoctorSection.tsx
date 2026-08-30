import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import ButtonLink from "@/components/common/ButtonLink";
import { doctorInfo } from "@/lib/data";

const AboutDoctorSection = () => {
  return (
    <section
      id="about-doctor"
      aria-labelledby="about-doctor-title"
      className="bg-[#F4F8FC] py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)] lg:gap-16 xl:gap-20">
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div
              className="absolute -bottom-5 -left-5 h-32 w-32 rounded-[2rem] bg-amber-200/45"
              aria-hidden="true"
            />
            <div
              className="absolute -right-5 -top-5 h-40 w-40 rounded-full border border-sky-300/35"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-2 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.6)]">
              <Image
                src="/images/about/dr-wong-portrait.webp"
                alt="Portrait of Dr. Christopher B. Wong"
                width={880}
                height={1100}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="aspect-[4/5] h-auto w-full rounded-[1.55rem] object-cover"
              />
            </div>
            <div className="relative -mt-10 ml-5 mr-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-lg sm:ml-8 sm:mr-8">
              <p className="font-heading text-lg font-bold text-slate-950">
                {doctorInfo.name}, {doctorInfo.title}
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                Conservative dentistry · Practicing {doctorInfo.experience.toLowerCase()}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Meet Your Dentist
            </p>
            <h2
              id="about-doctor-title"
              className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-5xl"
            >
              Conservative Care Starts With Listening
            </h2>
            <p className="mt-6 text-pretty text-lg leading-8 text-slate-700">
              Dr. Wong graduated from the University of the Pacific Arthur A.
              Dugoni School of Dentistry in 2018. His approach focuses on
              prevention, early detection, and preserving natural tooth
              structure whenever possible.
            </p>
            <p className="mt-5 text-pretty text-base leading-7 text-slate-600 md:text-lg">
              He focuses on{" "}
              <Link href="/invisalign" className="ui-link-premium">
                Invisalign
              </Link>
              ,{" "}
              <Link href="/dental-implants" className="ui-link-premium">
                dental implant restoration
              </Link>
              , and restorative care, with an emphasis on explaining the why
              behind every recommendation.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {doctorInfo.credentials.map((credential) => (
                <li
                  key={credential}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm leading-6 text-slate-700"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{credential}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <ButtonLink
                href="/about"
                size="lg"
                className="min-h-12 rounded-full px-7 text-base font-semibold"
              >
                Meet Dr. Christopher Wong
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutDoctorSection;
