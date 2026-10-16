import { LocationPage } from "@/components/locations/LocationPage";
import { stanford } from "@/data/locations";

/** Stanford page: content lives in client/src/data/locations.ts. */
const DentistStanford = () => <LocationPage location={stanford} />;

export default DentistStanford;
