import { LocationPage } from "@/components/locations/LocationPage";
import { menloPark } from "@/data/locations";

/** Menlo Park page: content lives in client/src/data/locations.ts. */
const DentistMenloPark = () => <LocationPage location={menloPark} />;

export default DentistMenloPark;
