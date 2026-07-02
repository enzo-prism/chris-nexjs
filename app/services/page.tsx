import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Services from "@/pages/Services";
import { getStorage } from "../../server/storage/repository";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["services"] },
  });

export default async function ServicesPage() {
  const storage = await getStorage();
  const initialServices = await storage.getServices();

  return (
    <RouteShell ssrPath="/services">
      <Services initialServices={initialServices} />
    </RouteShell>
  );
}
