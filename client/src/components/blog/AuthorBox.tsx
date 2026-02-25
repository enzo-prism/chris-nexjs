import OptimizedImage from "@/components/seo/OptimizedImage";
import { doctorInfo } from "@/lib/data";
import { drWongImages } from "@/lib/imageUrls";
import { CheckCircle } from "lucide-react";

const AuthorBox = () => {
  const shortBio = doctorInfo.bio.split(". ").slice(0, 2).join(". ").trim();

  return (
    <section className="py-10 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            <div className="w-full sm:w-40 shrink-0">
              <OptimizedImage
                src={drWongImages.drWongPortrait1}
                alt="Dr. Christopher B. Wong"
                className="w-full aspect-[4/5] rounded-2xl object-cover"
                priority={false}
              />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-primary font-semibold">
                  Reviewed by Dr. Wong
                </p>
                <h3 className="text-2xl font-heading font-bold text-slate-900">
                  {doctorInfo.name}, {doctorInfo.title}
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Lead dentist at Christopher B. Wong, DDS in Palo Alto.
                </p>
              </div>

              <p className="text-slate-700 leading-relaxed">
                {shortBio.endsWith(".") ? shortBio : `${shortBio}.`}
              </p>

              {doctorInfo.credentials?.length ? (
                <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-700">
                  {doctorInfo.credentials.map((credential) => (
                    <li key={credential} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{credential}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthorBox;
