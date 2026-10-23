import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Testimonials from "@/pages/Testimonials";
import { getGoogleReviewStats } from "../../server/googlePlaceReviews";
import { getPublishedTestimonials } from "../../server/storage/publishedTestimonials";

// Next requires a numeric literal here (not an imported constant).
export const revalidate = 86400;

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["testimonials"] },
  });

export default async function TestimonialsPage() {
  const [initialTestimonials, reviewStats] = await Promise.all([
    getPublishedTestimonials(),
    getGoogleReviewStats(),
  ]);

  return (
    <RouteShell ssrPath="/testimonials">
      <Testimonials initialTestimonials={initialTestimonials} reviewStats={reviewStats} />
    </RouteShell>
  );
}
