"use client";

import dynamic from "next/dynamic";

import { INVISALIGN_CONSULT_FORM_NAME } from "@/lib/appointmentLead";

const AppointmentForm = dynamic(
  () => import("@/components/forms/AppointmentForm"),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="min-h-[960px] w-full rounded-[1.25rem] bg-cream-50 md:min-h-[852px]"
      />
    ),
  },
);

/** On-page Invisalign consult request. Reuses the schedule Formspree form. */
export function InvisalignConsultForm() {
  return (
    <AppointmentForm
      presentation="funnel"
      leadFormName={INVISALIGN_CONSULT_FORM_NAME}
      defaultAppointmentType="Invisalign Consultation"
    />
  );
}

export default InvisalignConsultForm;
