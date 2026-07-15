import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import { notFound } from "next/navigation";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["ga-test"] },
  });

export default function GATestRoutePage() {
  notFound();
}
