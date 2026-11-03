import dynamic from "next/dynamic";

import {
  INVISALIGN_CONSULT_GRAPHICS,
  INVISALIGN_CONSULT_HAS_MEDIA,
  INVISALIGN_CONSULT_VIDEOS,
} from "@/pages/invisalignConsultMedia.data";

const InvisalignMediaSection = dynamic(
  () => import("@/components/invisalign/InvisalignMediaSection"),
);

export function ConsultMediaSlot() {
  if (!INVISALIGN_CONSULT_HAS_MEDIA) {
    return null;
  }

  return (
    <InvisalignMediaSection
      videos={INVISALIGN_CONSULT_VIDEOS}
      graphics={INVISALIGN_CONSULT_GRAPHICS}
    />
  );
}

export default ConsultMediaSlot;
