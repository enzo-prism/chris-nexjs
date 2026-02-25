import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Testimonials from "@/pages/Testimonials";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["testimonials"] },
  });

export default function TestimonialsPage() {
  return (
    <RouteShell ssrPath="/testimonials">
      <Testimonials />
    </RouteShell>
  );
}

