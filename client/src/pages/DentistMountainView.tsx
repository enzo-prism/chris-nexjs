import { LocationPage } from "@/components/locations/LocationPage";
import { mountainView } from "@/data/locations";

/** Mountain View page: content lives in client/src/data/locations.ts. */
const DentistMountainView = () => <LocationPage location={mountainView} />;

export default DentistMountainView;
