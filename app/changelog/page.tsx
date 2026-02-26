import RouteShell from "../[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "../[...slug]/page";
import Changelog from "@/pages/Changelog";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: { slug: ["changelog"] },
  });

export default function ChangelogPage() {
  return (
    <RouteShell ssrPath="/changelog">
      <Changelog />
    </RouteShell>
  );
}
