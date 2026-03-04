import { z } from "zod";

export const appointmentTypeOptions = [
  "New Patient Exam & Cleaning",
  "Existing Patient Checkup",
  "Invisalign Consultation",
  "Cosmetic Consultation",
  "Emergency Visit",
  "Other",
] as const;

export const preferredDayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export const preferredTimeOptions = [
  "Morning (8am-11am)",
  "Midday (11am-2pm)",
  "Afternoon (2pm-5pm)",
  "First Available",
] as const;

export const schedulingModeOptions = ["first_available", "choose_preferences"] as const;
export const contactPreferenceOptions = ["phone", "text", "email"] as const;

export type SchedulingMode = (typeof schedulingModeOptions)[number];
export type ContactPreference = (typeof contactPreferenceOptions)[number];

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .or(z.literal(""));

export const normalizeSchedulePhone = (value: string): string | null => {
  const digits = value.replace(/\D/g, "");
  if (/^\d{10}$/.test(digits)) {
    return digits;
  }
  if (/^1\d{10}$/.test(digits)) {
    return digits.slice(1);
  }
  return null;
};

export const isValidSchedulePhone = (value: string): boolean =>
  normalizeSchedulePhone(value) !== null;

export const scheduleRequestV2Schema = z
  .object({
    firstName: z.string().trim().min(1).max(40),
    lastName: z.string().trim().min(1).max(40),
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required.")
      .refine(
        (value) => isValidSchedulePhone(value),
        "Phone number must include 10 digits (or 11 digits starting with 1).",
      ),
    email: z.string().trim().email(),
    appointmentType: z.enum(appointmentTypeOptions),
    isEmergency: z.boolean().default(false),
    schedulingMode: z.enum(schedulingModeOptions),
    preferredDays: z.array(z.enum(preferredDayOptions)).max(3).optional(),
    preferredTime: z.enum(preferredTimeOptions).optional(),
    contactPreference: z.enum(contactPreferenceOptions).default("phone"),
    insuranceProvider: optionalText(80),
    message: optionalText(300),
    source: z.string().trim().max(80).optional(),
    sourceUrl: z.string().trim().url().optional(),
    utmParams: z.record(z.string()).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.schedulingMode !== "choose_preferences") {
      return;
    }

    if (!value.preferredDays || value.preferredDays.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pick at least one preferred day.",
        path: ["preferredDays"],
      });
    }

    if (!value.preferredTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a preferred time.",
        path: ["preferredTime"],
      });
    }
  });

export const legacyScheduleRequestSchema = z.object({
  emergency: z.boolean(),
  appointmentType: z.enum(appointmentTypeOptions),
  preferredDays: z.array(z.enum(preferredDayOptions)).min(1),
  preferredTimeOfDay: z.enum(preferredTimeOptions),
  firstName: z.string().trim().min(1).max(40),
  lastName: z.string().trim().min(1).max(40),
  phone: z.string().trim().min(1),
  email: z.string().trim().email(),
  insuranceStatus: z.enum(["Yes", "No", "Not Sure"]).optional(),
  additionalNotes: z.string().trim().max(300).optional(),
  sourceUrl: z.string().trim().url().optional(),
  utmParams: z.record(z.string()).optional(),
});

export type ScheduleRequestV2 = z.infer<typeof scheduleRequestV2Schema>;
export type LegacyScheduleRequest = z.infer<typeof legacyScheduleRequestSchema>;
