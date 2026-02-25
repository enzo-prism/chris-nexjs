import RouteShell from "./[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "./[...slug]/page";
import Home from "@/pages/Home";
import { getStorage } from "../server/storage/repository";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: {},
  });

export default async function HomePage() {
  const storage = await getStorage();
  const [services, testimonials] = await Promise.all([
    storage.getServices(),
    storage.getTestimonials(),
  ]);

  return (
    <RouteShell
      ssrPath="/"
      enableQueryClient={false}
      enableHelmet={false}
    >
      <Home
        initialServices={services}
        initialTestimonials={testimonials}
      />
    </RouteShell>
  );
}
