import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import { notFound } from "next/navigation";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["analytics"] },
  });

export default function AnalyticsPage() {
  notFound();
}
