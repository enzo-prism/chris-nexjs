import RouteShell from "./[...slug]/page-shell";
import { generateMetadata as generateCatchallMetadata } from "./[...slug]/page";
import Home from "@/pages/Home";

export const generateMetadata = async () =>
  generateCatchallMetadata({
    params: {},
  });

export default function HomePage() {
  return (
    <RouteShell ssrPath="/">
      <Home />
    </RouteShell>
  );
}
