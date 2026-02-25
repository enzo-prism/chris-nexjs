import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import DentalVeneers from "@/pages/DentalVeneers";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["dental-veneers"] },
  });

export default function DentalVeneersPage() {
  return (
    <RouteShell ssrPath="/dental-veneers">
      <DentalVeneers />
    </RouteShell>
  );
}

