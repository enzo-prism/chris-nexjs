"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Control, type FieldPath, useForm } from "react-hook-form";
import { z } from "zod";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  Phone,
  PhoneCall,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { trackGAEvent } from "@/lib/analytics";
import { officeInfo } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  appointmentTypeOptions,
  contactPreferenceOptions,
  isValidSchedulePhone,
  preferredDayOptions,
  preferredTimeOptions,
  scheduleRequestV2Schema,
  type ScheduleRequestV2,
} from "@shared/scheduleRequest";
import { cn } from "@/lib/utils";

const scheduleFormSchema = z
  .object({
    isEmergency: z.boolean(),
    appointmentType: z
      .string()
      .min(1, "Please select an appointment type.")
      .refine(
        (value) =>
          appointmentTypeOptions.includes(
            value as (typeof appointmentTypeOptions)[number],
          ),
        { message: "Please select an appointment type." },
      ),
    schedulingMode: z.enum(["first_available", "choose_preferences"]),
    preferredDays: z.array(z.enum(preferredDayOptions)).max(3),
    preferredTime: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (value) =>
          value === undefined ||
          value === "" ||
          preferredTimeOptions.includes(
            value as (typeof preferredTimeOptions)[number],
          ),
        { message: "Please select a preferred time." },
      ),
    firstName: z.string().trim().min(1, "First name is required.").max(40),
    lastName: z.string().trim().min(1, "Last name is required.").max(40),
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required.")
      .refine(
        (value) => isValidSchedulePhone(value),
        "Phone number must include 10 digits (or 11 digits starting with 1).",
      ),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Please enter a valid email."),
    contactPreference: z.enum(contactPreferenceOptions),
    insuranceProvider: z.string().trim().max(80).optional().or(z.literal("")),
    message: z.string().trim().max(300).optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (value.schedulingMode !== "choose_preferences") {
      return;
    }

    if (!value.preferredDays || value.preferredDays.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pick at least one day.",
        path: ["preferredDays"],
      });
    }

    if (!value.preferredTime || value.preferredTime.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a preferred time.",
        path: ["preferredTime"],
      });
    }
  });

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

type SubmitStatus = "idle" | "submitting" | "success" | "error";
type StepName = "visit_needs" | "contact_details" | "scheduling_preferences";
type StepMeta = {
  index: number;
  name: StepName;
  title: string;
  description: string;
};
type FieldErrorSummary = {
  field: FieldPath<ScheduleFormValues>;
  message: string;
};
type FormPresentation = "default" | "funnel";

const extractUtmParams = (url: string): Record<string, string> => {
  try {
    const parsed = new URL(url);
    const params = new URLSearchParams(parsed.search);
    const utmValues: Record<string, string> = {};

    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ].forEach((key) => {
      const value = params.get(key);
      if (value) {
        utmValues[key] = value;
      }
    });

    return utmValues;
  } catch {
    return {};
  }
};

type AppointmentFormProps = {
  readonly className?: string;
  readonly presentation?: FormPresentation;
};

const visitNeedsFields: FieldPath<ScheduleFormValues>[] = [
  "appointmentType",
  "isEmergency",
  "schedulingMode",
];

const contactFields: FieldPath<ScheduleFormValues>[] = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "contactPreference",
];

const preferenceFields: FieldPath<ScheduleFormValues>[] = [
  "preferredDays",
  "preferredTime",
];

const schedulingModeDetails: Record<ScheduleFormValues["schedulingMode"], {
  title: string;
  description: string;
  icon: typeof Clock3;
}> = {
  first_available: {
    title: "First available opening",
    description: "Best if you want the quickest visit with the fewest choices.",
    icon: Clock3,
  },
  choose_preferences: {
    title: "Choose days and times",
    description: "Best if you want to share windows that fit your schedule.",
    icon: CalendarDays,
  },
};

const contactPreferenceHints: Record<string, string> = {
  phone: "Best for quick confirmations",
  text: "Great for short updates",
  email: "Best if you prefer written details",
};

const getDeviceType = (): "mobile" | "tablet" | "desktop" | "unknown" => {
  if (typeof window === "undefined") {
    return "unknown";
  }

  if (window.matchMedia("(max-width: 767px)").matches) {
    return "mobile";
  }

  if (window.matchMedia("(max-width: 1023px)").matches) {
    return "tablet";
  }

  return "desktop";
};

const getChoiceCardClasses = (
  presentation: FormPresentation,
  selected: boolean,
  centered = false,
): string =>
  cn(
    presentation === "funnel"
      ? [
          "ui-focus-premium flex min-h-14 cursor-pointer rounded-[22px] border px-4 py-4 transition-[border-color,background-color,box-shadow,transform]",
          centered ? "flex-col items-start text-left sm:items-center sm:text-center" : "items-start justify-start text-left",
          selected
            ? "border-primary/45 bg-primary/[0.07] shadow-[0_18px_36px_-28px_rgba(37,99,235,0.65)]"
            : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/[0.02]",
        ]
      : [
          "ui-chip-interactive flex min-h-11 cursor-pointer px-4 py-3 text-sm font-medium focus-within:border-primary focus-within:shadow-[var(--ui-focus-shadow)]",
          centered ? "items-center justify-center text-center" : "items-center justify-start",
        ],
  );

const getFunnelInputClasses = (): string =>
  "h-12 rounded-2xl border-slate-200 bg-slate-50/75 px-4 text-[15px] text-slate-900 placeholder:text-slate-400 hover:border-primary/30 focus-visible:bg-white";

const getFunnelTextareaClasses = (): string =>
  "rounded-2xl border-slate-200 bg-slate-50/75 px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 hover:border-primary/30 focus-visible:bg-white";

type OptionalDetailsFieldsProps = {
  control: Control<ScheduleFormValues>;
  presentation: FormPresentation;
  remainingNotesCharacters: number;
  collapsible?: boolean;
};

const OptionalDetailsFields = ({
  control,
  presentation,
  remainingNotesCharacters,
  collapsible = false,
}: OptionalDetailsFieldsProps) => {
  const fieldContent = (
    <div className={cn(presentation === "funnel" ? "space-y-5" : "space-y-6")}>
      <FormField
        control={control}
        name="insuranceProvider"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dental Insurance Provider (Optional)</FormLabel>
            <FormControl>
              <Input
                inputMode="text"
                autoComplete="organization"
                placeholder="Delta Dental, MetLife, Aetna..."
                maxLength={80}
                className={
                  presentation === "funnel" ? getFunnelInputClasses() : "h-11"
                }
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Share anything helpful such as pain, referral details, treatment goals, or insurance notes."
                maxLength={300}
                rows={presentation === "funnel" ? 5 : 4}
                className={
                  presentation === "funnel" ? getFunnelTextareaClasses() : undefined
                }
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <p className="mt-1 text-xs text-slate-500">
              {remainingNotesCharacters} characters left.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  if (!collapsible) {
    return fieldContent;
  }

  return (
    <details className="group rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 open:bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <div>
          <p className="text-sm font-semibold text-slate-900">Optional details</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Add insurance information or anything else you want our team to know.
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" aria-hidden="true" />
      </summary>
      <div className="border-t border-slate-200 px-5 py-5">{fieldContent}</div>
    </details>
  );
};

type VisitNeedsStepProps = {
  control: Control<ScheduleFormValues>;
  presentation: FormPresentation;
};

const VisitNeedsStep = ({ control, presentation }: VisitNeedsStepProps) => {
  const funnelIntro =
    presentation === "funnel" ? (
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
            Visit Details
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
            What can we help you with?
          </h3>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Choose the visit you need, then decide whether you want the first opening or your own preferred times.
          </p>
        </div>
      </div>
    ) : null;

  return (
    <div className={cn(presentation === "funnel" ? "space-y-8" : "space-y-6")}>
      {funnelIntro}

      <FormField
        control={control}
        name="isEmergency"
        render={({ field }) => (
          <FormItem>
            <label
              className={cn(
                "ui-focus-premium flex min-h-11 items-start gap-3 transition-[border-color,background-color,box-shadow] focus-within:border-primary focus-within:shadow-[var(--ui-focus-shadow)]",
                presentation === "funnel"
                  ? "rounded-[24px] border border-rose-200 bg-rose-50/70 px-5 py-4 hover:border-rose-300"
                  : "rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-primary/40",
              )}
            >
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  id="appointment-emergency"
                  aria-describedby="appointment-emergency-help"
                  className="mt-0.5 h-5 w-5"
                />
              </FormControl>
              <div className={cn("text-sm", presentation === "funnel" ? "text-slate-700" : "text-[#333333]")}>
                <Label
                  htmlFor="appointment-emergency"
                  className="font-semibold leading-relaxed"
                >
                  I&apos;m in pain or need urgent care
                </Label>
                <p
                  id="appointment-emergency-help"
                  className={cn(
                    "mt-1 text-xs",
                    presentation === "funnel" ? "text-rose-700/80" : "text-slate-500",
                  )}
                >
                  Select this and we&apos;ll prioritize the earliest appropriate follow-up.
                </p>
              </div>
            </label>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="appointmentType"
        render={({ field }) => (
          <FormItem>
            <div className="space-y-2">
              <FormLabel>Appointment Type</FormLabel>
              {presentation === "funnel" ? (
                <p className="text-sm leading-6 text-slate-600">
                  Pick the option that best matches why you&apos;re reaching out.
                </p>
              ) : null}
            </div>
            <FormControl>
              <RadioGroup
                className={cn(presentation === "funnel" ? "grid gap-3" : "grid gap-2")}
                value={field.value}
                onValueChange={field.onChange}
                aria-label="Appointment Type"
              >
                {appointmentTypeOptions.map((option) => {
                  const isSelected = field.value === option;
                  return (
                    <label
                      key={option}
                      data-selected={isSelected ? "true" : "false"}
                      className={getChoiceCardClasses(presentation, isSelected)}
                    >
                      <RadioGroupItem
                        value={option}
                        id={`appointment-type-${option.replace(/\W+/g, "-").toLowerCase()}`}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          presentation === "funnel"
                            ? "text-sm font-semibold leading-6 text-slate-900"
                            : "text-sm font-medium",
                        )}
                      >
                        {option}
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="schedulingMode"
        render={({ field }) => (
          <FormItem>
            <div className="space-y-2">
              <FormLabel>Scheduling Preference</FormLabel>
              {presentation === "funnel" ? (
                <p className="text-sm leading-6 text-slate-600">
                  Keep it simple with the first opening, or share the windows that fit your calendar.
                </p>
              ) : null}
            </div>
            <FormControl>
              <RadioGroup
                className={cn(
                  presentation === "funnel" ? "grid gap-3 sm:grid-cols-2" : "grid grid-cols-1 gap-2 sm:grid-cols-2",
                )}
                value={field.value}
                onValueChange={field.onChange}
                aria-label="Scheduling preference"
              >
                {(Object.entries(schedulingModeDetails) as Array<[
                  ScheduleFormValues["schedulingMode"],
                  (typeof schedulingModeDetails)[ScheduleFormValues["schedulingMode"]],
                ]>).map(([value, meta]) => {
                  const isSelected = field.value === value;
                  const Icon = meta.icon;
                  return (
                    <label
                      key={value}
                      data-selected={isSelected ? "true" : "false"}
                      className={getChoiceCardClasses(presentation, isSelected)}
                    >
                      <RadioGroupItem
                        value={value}
                        id={`scheduling-mode-${value}`}
                        className="sr-only"
                      />
                      {presentation === "funnel" ? (
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-full bg-primary/[0.08] p-2 text-primary">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div>
                            <span className="block text-sm font-semibold leading-6 text-slate-900">
                              {meta.title}
                            </span>
                            <span className="mt-1 block text-sm leading-6 text-slate-600">
                              {meta.description}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span>
                          {value === "first_available"
                            ? "Give me the first available opening"
                            : "I want to choose preferred days and times"}
                        </span>
                      )}
                    </label>
                  );
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

type ContactStepProps = {
  control: Control<ScheduleFormValues>;
  presentation: FormPresentation;
  remainingNotesCharacters: number;
};

const ContactStep = ({
  control,
  presentation,
  remainingNotesCharacters,
}: ContactStepProps) => {
  return (
    <div className={cn(presentation === "funnel" ? "space-y-8" : "space-y-6")}>
      {presentation === "funnel" ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
            Contact Details
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
            How should we reach you?
          </h3>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            We&apos;ll only use this information to confirm your visit and answer scheduling questions.
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "grid md:grid-cols-2",
          presentation === "funnel" ? "gap-5" : "gap-4",
        )}
      >
        <FormField
          control={control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input
                  inputMode="text"
                  placeholder="Jane"
                  maxLength={40}
                  autoComplete="given-name"
                  className={
                    presentation === "funnel" ? getFunnelInputClasses() : "h-11"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input
                  inputMode="text"
                  placeholder="Doe"
                  maxLength={40}
                  autoComplete="family-name"
                  className={
                    presentation === "funnel" ? getFunnelInputClasses() : "h-11"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div
        className={cn(
          "grid md:grid-cols-2",
          presentation === "funnel" ? "gap-5" : "gap-4",
        )}
      >
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(650) 555-1234"
                  className={
                    presentation === "funnel" ? getFunnelInputClasses() : "h-11"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="jane.doe@example.com"
                  className={
                    presentation === "funnel" ? getFunnelInputClasses() : "h-11"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="contactPreference"
        render={({ field }) => (
          <FormItem>
            <div className="space-y-2">
              <FormLabel>Preferred Contact Method</FormLabel>
              {presentation === "funnel" ? (
                <p className="text-sm leading-6 text-slate-600">
                  We&apos;ll try this option first when confirming your appointment.
                </p>
              ) : null}
            </div>
            <FormControl>
              <RadioGroup
                className={cn(
                  presentation === "funnel" ? "grid grid-cols-1 gap-3 sm:grid-cols-3" : "grid grid-cols-1 gap-2 sm:grid-cols-3",
                )}
                value={field.value}
                onValueChange={field.onChange}
                aria-label="Preferred contact method"
              >
                {contactPreferenceOptions.map((option) => {
                  const isSelected = field.value === option;
                  const Icon = option === "email" ? Mail : Phone;
                  return (
                    <label
                      key={option}
                      data-selected={isSelected ? "true" : "false"}
                      className={getChoiceCardClasses(presentation, isSelected, true)}
                    >
                      <RadioGroupItem
                        value={option}
                        id={`contact-preference-${option}`}
                        className="sr-only"
                      />
                      {presentation === "funnel" ? (
                        <>
                          <span className="inline-flex rounded-full bg-primary/[0.08] p-2 text-primary">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="mt-3 block text-sm font-semibold capitalize leading-6 text-slate-900">
                            {option}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            {contactPreferenceHints[option] ?? "We'll use this to follow up."}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-medium capitalize">{option}</span>
                      )}
                    </label>
                  );
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {presentation === "funnel" ? (
        <OptionalDetailsFields
          control={control}
          presentation={presentation}
          remainingNotesCharacters={remainingNotesCharacters}
          collapsible
        />
      ) : null}
    </div>
  );
};

type PreferenceStepProps = {
  control: Control<ScheduleFormValues>;
  presentation: FormPresentation;
  remainingNotesCharacters: number;
};

const PreferenceStep = ({
  control,
  presentation,
  remainingNotesCharacters,
}: PreferenceStepProps) => {
  return (
    <div className={cn(presentation === "funnel" ? "space-y-8" : "space-y-6")}>
      {presentation === "funnel" ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
            Scheduling Preferences
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
            Share the times that work best
          </h3>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Pick up to three days and the part of the day that usually works best.
          </p>
        </div>
      ) : null}

      <FormField
        control={control}
        name="preferredDays"
        render={({ field }) => {
          const values: Array<(typeof preferredDayOptions)[number]> = field.value ?? [];
          return (
            <FormItem>
              <div className="space-y-2">
              <FormLabel>Preferred Days (choose up to 3)</FormLabel>
              {presentation === "funnel" ? (
                <p className="text-sm leading-6 text-slate-600">
                  Friday visits are usually available through early afternoon.
                </p>
              ) : null}
            </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {preferredDayOptions.map((day) => {
                  const checked = values.includes(day);
                  return (
                    <label
                      key={day}
                      htmlFor={`preferred-day-${day}`}
                      data-selected={checked ? "true" : "false"}
                      className={getChoiceCardClasses(presentation, checked)}
                    >
                      <span className="text-sm font-semibold text-slate-900">{day}</span>
                      <Checkbox
                        id={`preferred-day-${day}`}
                        checked={checked}
                        onCheckedChange={(checkedValue) => {
                          const nextValues = checkedValue
                            ? [...new Set([...values, day])].slice(0, 3)
                            : values.filter((value) => value !== day);
                          field.onChange(nextValues);
                        }}
                        className="ml-auto h-5 w-5"
                      />
                    </label>
                  );
                })}
              </div>
              {presentation === "default" ? (
                <p className="text-xs text-slate-500">
                  Friday appointments are available through early afternoon.
                </p>
              ) : null}
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        control={control}
        name="preferredTime"
        render={({ field }) => (
          <FormItem>
            <div className="space-y-2">
              <FormLabel>Preferred Time of Day</FormLabel>
              {presentation === "funnel" ? (
                <p className="text-sm leading-6 text-slate-600">
                  Choose the window that is easiest for you and we&apos;ll do our best to match it.
                </p>
              ) : null}
            </div>
            <FormControl>
              <RadioGroup
                className={cn(presentation === "funnel" ? "grid gap-3" : "grid grid-cols-1 gap-2")}
                value={field.value}
                onValueChange={field.onChange}
                aria-label="Preferred Time of Day"
              >
                {preferredTimeOptions.map((option) => {
                  const isSelected = field.value === option;
                  return (
                    <label
                      key={option}
                      data-selected={isSelected ? "true" : "false"}
                      className={getChoiceCardClasses(presentation, isSelected)}
                    >
                      <RadioGroupItem
                        value={option}
                        id={`preferred-time-${option.replace(/\W+/g, "-").toLowerCase()}`}
                        className="sr-only"
                      />
                      <span className="text-sm font-semibold text-slate-900">{option}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {presentation === "default" ? (
        <OptionalDetailsFields
          control={control}
          presentation={presentation}
          remainingNotesCharacters={remainingNotesCharacters}
        />
      ) : null}
    </div>
  );
};

const AppointmentForm = ({
  className = "",
  presentation = "default",
}: AppointmentFormProps) => {
  const [step, setStep] = useState<number>(1);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorSummary, setErrorSummary] = useState<FieldErrorSummary[]>([]);
  const hasTrackedStart = useRef(false);
  const hasTrackedView = useRef(false);
  const completionStateRef = useRef(false);
  const abandonmentTimersRef = useRef<number[]>([]);
  const lastStepViewRef = useRef("");
  const stepTrackingRef = useRef<{ index: number; name: StepName }>({
    index: 1,
    name: "visit_needs",
  });

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      isEmergency: false,
      appointmentType: "",
      schedulingMode: "choose_preferences",
      preferredDays: [],
      preferredTime: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      contactPreference: "phone",
      insuranceProvider: "",
      message: "",
    },
    mode: "onBlur",
  });

  const {
    control,
    trigger,
    getValues,
    getFieldState,
    setFocus,
    handleSubmit,
    watch,
    formState: { isSubmitting },
    reset,
  } = form;

  const formValues = watch();
  const schedulingMode = formValues.schedulingMode;
  const totalSteps = schedulingMode === "first_available" ? 2 : 3;
  const activeStep = Math.min(step, totalSteps);
  const notesValue = formValues.message || "";
  const remainingNotesCharacters = Math.max(300 - notesValue.length, 0);

  const analyticsContext = useMemo(
    () => ({
      device_type: getDeviceType(),
      schedulingMode: formValues.schedulingMode,
      appointmentType: formValues.appointmentType || "unselected",
      isEmergency: formValues.isEmergency ? "true" : "false",
    }),
    [formValues.appointmentType, formValues.isEmergency, formValues.schedulingMode],
  );

  const stepMeta: StepMeta = useMemo(() => {
    if (activeStep === 1) {
      return {
        index: 1,
        name: "visit_needs",
        title: "Visit Needs",
        description: "Tell us what you need so we can route your request quickly.",
      };
    }
    if (activeStep === 2) {
      return {
        index: 2,
        name: "contact_details",
        title: "Contact Details",
        description: "Share the best way to confirm your appointment.",
      };
    }
    return {
      index: 3,
      name: "scheduling_preferences",
      title: "Scheduling Preferences",
      description: "Pick your ideal day and time windows.",
    };
  }, [activeStep]);

  useEffect(() => {
    if (step > totalSteps) {
      setStep(totalSteps);
    }
  }, [step, totalSteps]);

  useEffect(() => {
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      trackGAEvent("schedule_view", {
        source: "schedule_page_form",
        ...analyticsContext,
      });
    }

    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      trackGAEvent("schedule_start", {
        source: "schedule_page_form",
        ...analyticsContext,
      });
    }
  }, [analyticsContext]);

  useEffect(() => {
    const stepKey = `${stepMeta.index}:${stepMeta.name}:${totalSteps}`;
    if (lastStepViewRef.current === stepKey) {
      return;
    }
    stepTrackingRef.current = {
      index: stepMeta.index,
      name: stepMeta.name,
    };
    lastStepViewRef.current = stepKey;
    trackGAEvent("schedule_step_view", {
      source: "schedule_page_form",
      step_index: stepMeta.index,
      step_name: stepMeta.name,
      total_steps: totalSteps,
      ...analyticsContext,
    });
  }, [analyticsContext, stepMeta, totalSteps]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const checkpoints = [30, 90];
    abandonmentTimersRef.current = checkpoints.map((seconds) =>
      window.setTimeout(() => {
        if (completionStateRef.current) {
          return;
        }
        const currentValues = getValues();
        const currentStep = stepTrackingRef.current;
        trackGAEvent("schedule_abandonment_checkpoint", {
          source: "schedule_page_form",
          seconds_elapsed: seconds,
          step_index: currentStep.index,
          step_name: currentStep.name,
          schedulingMode: currentValues.schedulingMode,
          appointmentType: currentValues.appointmentType || "unselected",
          isEmergency: currentValues.isEmergency ? "true" : "false",
          device_type: getDeviceType(),
        });
      }, seconds * 1000),
    );

    return () => {
      abandonmentTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      abandonmentTimersRef.current = [];
    };
  }, [getValues]);

  const updateErrorSummary = (fields: FieldPath<ScheduleFormValues>[]) => {
    const nextErrors: FieldErrorSummary[] = [];
    for (const field of fields) {
      const message = getFieldState(field).error?.message;
      if (typeof message === "string" && message.trim()) {
        nextErrors.push({ field, message });
      }
    }
    setErrorSummary(nextErrors);
    return nextErrors;
  };

  const trackFieldErrors = (errors: FieldErrorSummary[]) => {
    for (const error of errors) {
      trackGAEvent("schedule_field_error", {
        source: "schedule_page_form",
        field: error.field,
        error_type: error.message,
        step_index: activeStep,
        step_name: stepMeta.name,
        ...analyticsContext,
      });
    }
  };

  const fieldsForStep = (currentStep: number): FieldPath<ScheduleFormValues>[] => {
    if (currentStep === 1) {
      return visitNeedsFields;
    }
    if (currentStep === 2) {
      return contactFields;
    }
    return preferenceFields;
  };

  const goToNextStep = async () => {
    const currentFields = fieldsForStep(activeStep);
    const isValid = await trigger(currentFields);
    if (!isValid) {
      const errors = updateErrorSummary(currentFields);
      trackFieldErrors(errors);
      if (errors[0]) {
        setFocus(errors[0].field);
      }
      return;
    }

    setErrorSummary([]);
    trackGAEvent("schedule_step_continue", {
      source: "schedule_page_form",
      step_index: activeStep,
      step_name: stepMeta.name,
      total_steps: totalSteps,
      ...analyticsContext,
    });
    setStep(Math.min(activeStep + 1, totalSteps));
  };

  const goToPreviousStep = () => {
    if (activeStep <= 1) {
      return;
    }
    setErrorSummary([]);
    trackGAEvent("schedule_back", {
      source: "schedule_page_form",
      step_index: activeStep,
      step_name: stepMeta.name,
      ...analyticsContext,
    });
    setStep(activeStep - 1);
  };

  const onSubmit = async (rawData: ScheduleFormValues) => {
    const sourceUrl = window.location.href;
    const normalizedPhone = rawData.phone.trim();

    const payload = scheduleRequestV2Schema.parse({
      isEmergency: rawData.isEmergency,
      appointmentType: rawData.appointmentType,
      schedulingMode: rawData.schedulingMode,
      preferredDays:
        rawData.schedulingMode === "choose_preferences"
          ? rawData.preferredDays
          : undefined,
      preferredTime:
        rawData.schedulingMode === "choose_preferences"
          ? rawData.preferredTime
          : undefined,
      firstName: rawData.firstName.trim(),
      lastName: rawData.lastName.trim(),
      phone: normalizedPhone,
      email: rawData.email.trim().toLowerCase(),
      contactPreference: rawData.contactPreference,
      insuranceProvider: rawData.insuranceProvider?.trim() || undefined,
      message: rawData.message?.trim() || undefined,
      source: "schedule_page_form_v2",
      sourceUrl,
      utmParams: extractUtmParams(sourceUrl),
    }) as ScheduleRequestV2;

    trackGAEvent("schedule_submit_attempt", {
      source: "schedule_page_form",
      step_index: activeStep,
      step_name: stepMeta.name,
      total_steps: totalSteps,
      ...analyticsContext,
    });

    setStatus("submitting");
    setErrorMessage("");
    setErrorSummary([]);

    try {
      const response = await fetch("/api/schedule-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const parsed = await response
          .json()
          .catch(() => ({ message: "Something went wrong. Please try again." }));
        throw new Error(parsed?.message ?? "Something went wrong. Please try again.");
      }

      trackGAEvent("schedule_submit_success", {
        source: "schedule_page_form",
        contactPreference: rawData.contactPreference,
        ...analyticsContext,
      });

      trackGAEvent("generate_lead", {
        form_name: "schedule_request_form",
        lead_type: "appointment_request",
        page_path:
          typeof window !== "undefined" ? window.location.pathname : "/schedule",
        appointment_type: rawData.appointmentType,
        scheduling_mode: rawData.schedulingMode,
        urgent_flag: rawData.isEmergency ? "true" : "false",
      });

      trackGAEvent("schedule_submit", {
        appointment_type: rawData.appointmentType,
        insurance_status: rawData.insuranceProvider ?? "not provided",
        urgent_flag: rawData.isEmergency ? "true" : "false",
      });

      if (rawData.isEmergency) {
        trackGAEvent("schedule_submit_emergency", {
          appointment_type: rawData.appointmentType,
          insurance_status: rawData.insuranceProvider ?? "not provided",
          urgent_flag: "true",
        });
      }

      if (rawData.appointmentType === "New Patient Exam & Cleaning") {
        trackGAEvent("schedule_submit_new_patient", {
          appointment_type: rawData.appointmentType,
          insurance_status: rawData.insuranceProvider ?? "not provided",
          urgent_flag: rawData.isEmergency ? "true" : "false",
        });
      }

      if (rawData.appointmentType === "Invisalign Consultation") {
        trackGAEvent("schedule_submit_invisalign", {
          appointment_type: rawData.appointmentType,
          insurance_status: rawData.insuranceProvider ?? "not provided",
          urgent_flag: rawData.isEmergency ? "true" : "false",
        });
      }

      completionStateRef.current = true;
      setStatus("success");
      setStep(1);
      reset();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
      trackGAEvent("schedule_submit_failure", {
        source: "schedule_page_form",
        reason: error instanceof Error ? error.message : "unknown_error",
        ...analyticsContext,
      });
      setStatus("error");
    }
  };

  const onInvalidSubmit = () => {
    const currentFields = fieldsForStep(activeStep);
    const errors = updateErrorSummary(currentFields);
    trackFieldErrors(errors);
    if (errors[0]) {
      setFocus(errors[0].field);
    }
  };

  if (status === "success") {
    return (
      <div
        className={cn(
          presentation === "funnel"
            ? "rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,#f3fbf6_0%,#ffffff_100%)] px-6 py-10 text-center shadow-[0_30px_90px_-60px_rgba(22,101,52,0.45)] sm:px-10"
            : "rounded-xl border border-emerald-100 bg-emerald-50 p-6 text-center",
        )}
        role="status"
      >
        <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden="true" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Request Received
        </p>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
          We&apos;ll confirm your appointment shortly.
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
          Our team will follow up within one business day by phone or email to lock in your visit and answer any final questions.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={`tel:${officeInfo.phoneE164}`}
            className="ui-focus-premium inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary/95"
          >
            <PhoneCall className="h-4 w-4" aria-hidden="true" />
            Call {officeInfo.phone}
          </a>
          <a
            href="/contact"
            className="ui-focus-premium inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-primary/35 hover:text-primary"
          >
            View office details
          </a>
        </div>
      </div>
    );
  }

  const progressWidth = `${(activeStep / totalSteps) * 100}%`;
  const formClasses = cn(
    presentation === "funnel" ? "space-y-8" : "space-y-6",
    className,
  );
  const footerHint =
    presentation === "funnel"
      ? activeStep < totalSteps
        ? "Most patients finish this form in under a minute."
        : "We'll confirm your request by phone or email within one business day."
      : "Response in one business day";

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
        className={formClasses}
        autoComplete="on"
      >
        {presentation === "funnel" ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                  Step {activeStep} of {totalSteps}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {stepMeta.title}
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Secure request
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              {stepMeta.description}
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Step {activeStep} of {totalSteps}
            </p>
            <h4 className="mt-1 text-lg font-semibold text-[#333333]">{stepMeta.title}</h4>
            <p className="mt-1 text-sm text-slate-600">{stepMeta.description}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        )}

        {activeStep === 1 ? (
          <VisitNeedsStep control={control} presentation={presentation} />
        ) : null}
        {activeStep === 2 ? (
          <ContactStep
            control={control}
            presentation={presentation}
            remainingNotesCharacters={remainingNotesCharacters}
          />
        ) : null}
        {activeStep === 3 ? (
          <PreferenceStep
            control={control}
            presentation={presentation}
            remainingNotesCharacters={remainingNotesCharacters}
          />
        ) : null}

        {errorSummary.length > 0 ? (
          <div
            className={cn(
              "rounded-lg border p-3 text-sm",
              presentation === "funnel"
                ? "border-amber-200 bg-amber-50/90 text-amber-950"
                : "border-amber-200 bg-amber-50 text-amber-900",
            )}
            role="alert"
            aria-live="assertive"
          >
            <p className="mb-2 flex items-center gap-2 font-semibold">
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              Please fix the fields below before continuing:
            </p>
            <ul className="space-y-1">
              {errorSummary.map((item) => (
                <li key={item.field}>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto justify-start whitespace-normal p-0 text-left underline underline-offset-2 hover:text-amber-950"
                    onClick={() => setFocus(item.field)}
                  >
                    {item.message}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {status === "error" && errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {presentation === "funnel" ? (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-md text-sm leading-6 text-slate-600">
                {footerHint}
              </div>
              <div className="flex gap-2 sm:min-w-[300px] sm:justify-end">
                {activeStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="ui-focus-premium min-h-11 flex-1 sm:flex-none"
                    onClick={goToPreviousStep}
                    disabled={isSubmitting || status === "submitting"}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                    Back
                  </Button>
                ) : (
                  <div className="hidden sm:block sm:flex-1" aria-hidden="true" />
                )}
                {activeStep < totalSteps ? (
                  <Button
                    type="button"
                    className="ui-btn-primary min-h-11 flex-1 text-base font-semibold sm:min-w-[180px]"
                    onClick={goToNextStep}
                    disabled={isSubmitting || status === "submitting"}
                  >
                    Continue
                    <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="ui-btn-primary min-h-11 flex-1 text-base font-semibold sm:min-w-[220px]"
                    disabled={isSubmitting || status === "submitting"}
                  >
                    {isSubmitting || status === "submitting"
                      ? "Submitting..."
                      : "Request My Appointment"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "sticky bottom-0 z-10 -mx-2 border-t border-slate-200 bg-white/95 px-2 pt-3 backdrop-blur",
              "pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:-mx-0 sm:px-0",
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <a
                href={`tel:${officeInfo.phoneE164}`}
                className="ui-focus-premium inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5"
              >
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
                Need urgent help? Call now
              </a>
              <span className="text-xs text-slate-500">{footerHint}</span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="ui-focus-premium min-h-11 flex-1"
                onClick={goToPreviousStep}
                disabled={activeStep === 1 || isSubmitting || status === "submitting"}
              >
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                Back
              </Button>
              {activeStep < totalSteps ? (
                <Button
                  type="button"
                  className="ui-btn-primary min-h-11 flex-1 text-base font-semibold"
                  onClick={goToNextStep}
                  disabled={isSubmitting || status === "submitting"}
                >
                  Continue
                  <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ui-btn-primary min-h-11 flex-1 text-base font-semibold"
                  disabled={isSubmitting || status === "submitting"}
                >
                  {isSubmitting || status === "submitting"
                    ? "Submitting..."
                    : "Request My Appointment"}
                </Button>
              )}
            </div>
          </div>
        )}
      </form>
    </Form>
  );
};

export default AppointmentForm;
