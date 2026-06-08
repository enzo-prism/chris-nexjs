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
  Pencil,
  Phone,
  PhoneCall,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import {
  trackAnalyticsEvent,
  trackGAEvent,
  trackLeadConversion,
} from "@/lib/analytics";
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
import { ANALYTICS_EVENTS, getAnalyticsPageContext } from "@shared/analytics";
import { FeatureIcon } from "@/components/common/FeatureIcon";
import { cn } from "@/lib/utils";

const EMERGENCY_APPOINTMENT_TYPE = "Emergency Visit";

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
type StepName = "visit_needs" | "scheduling_preferences" | "contact_details";
type StepConfig = {
  name: StepName;
  title: string;
  description: string;
  fields: FieldPath<ScheduleFormValues>[];
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
  "schedulingMode",
];

const preferenceFields: FieldPath<ScheduleFormValues>[] = [
  "preferredDays",
  "preferredTime",
];

const contactFields: FieldPath<ScheduleFormValues>[] = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "contactPreference",
];

const schedulingModeDetails: Record<ScheduleFormValues["schedulingMode"], {
  title: string;
  description: string;
  icon: typeof Clock3;
}> = {
  first_available: {
    title: "First available opening",
    description: "Quickest visit, fewest choices.",
    icon: Clock3,
  },
  choose_preferences: {
    title: "Choose days and times",
    description: "Share the windows that fit you.",
    icon: CalendarDays,
  },
};

const contactPreferenceHints: Record<string, string> = {
  phone: "Quick confirmations",
  email: "Written details",
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

const getScheduleFailureReason = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return "unknown_error";
  }

  const message = error.message.toLowerCase();
  if (message.includes("phone") || message.includes("valid")) {
    return "validation_error";
  }
  if (message.includes("fetch") || message.includes("network")) {
    return "network_error";
  }
  return "server_error";
};

const formatPhoneInput = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) {
    return "";
  }
  if (digits.length < 4) {
    return `(${digits}`;
  }
  if (digits.length < 7) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const getChoiceCardClasses = (
  presentation: FormPresentation,
  selected: boolean,
  centered = false,
): string =>
  cn(
    presentation === "funnel"
      ? [
          "ui-focus-premium flex min-h-14 cursor-pointer rounded-[18px] border px-4 py-3.5 transition-[border-color,background-color,box-shadow,transform]",
          centered
            ? "flex-col items-start text-left sm:items-center sm:text-center"
            : "items-center justify-start text-left",
          selected
            ? "border-primary/45 bg-primary/[0.07] shadow-[0_14px_30px_-26px_rgba(37,99,235,0.6)]"
            : "border-slate-200 bg-white hover:border-primary/30 hover:bg-primary/[0.02]",
        ]
      : [
          "ui-chip-interactive flex min-h-11 cursor-pointer px-4 py-3 text-sm font-medium focus-within:border-primary focus-within:shadow-[var(--ui-focus-shadow)]",
          centered ? "items-center justify-center text-center" : "items-center justify-start",
        ],
  );

const getFunnelInputClasses = (): string =>
  "h-12 rounded-xl border-slate-200 bg-slate-50/75 px-4 text-[15px] text-slate-900 placeholder:text-slate-400 hover:border-primary/30 focus-visible:bg-white";

const getFunnelTextareaClasses = (): string =>
  "rounded-xl border-slate-200 bg-slate-50/75 px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 hover:border-primary/30 focus-visible:bg-white";

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
            <FormLabel>Dental insurance provider</FormLabel>
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
            <FormLabel>Anything else we should know?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Pain, referral details, treatment goals, or insurance notes."
                maxLength={300}
                rows={presentation === "funnel" ? 4 : 4}
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
    <details className="group rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 open:bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold text-slate-900">
          Add insurance or notes{" "}
          <span className="font-normal text-slate-500">(optional)</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" aria-hidden="true" />
      </summary>
      <div className="border-t border-slate-200 px-5 py-5">{fieldContent}</div>
    </details>
  );
};

type StepProps = {
  control: Control<ScheduleFormValues>;
  presentation: FormPresentation;
};

const VisitNeedsStep = ({ control, presentation }: StepProps) => {
  return (
    <div className={cn(presentation === "funnel" ? "space-y-7" : "space-y-6")}>
      <FormField
        control={control}
        name="appointmentType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Appointment type</FormLabel>
            <FormControl>
              <RadioGroup
                className={cn(presentation === "funnel" ? "grid gap-2.5" : "grid gap-2")}
                value={field.value}
                onValueChange={field.onChange}
                aria-label="Appointment type"
              >
                {appointmentTypeOptions.map((option) => {
                  const isSelected = field.value === option;
                  const isEmergencyOption = option === EMERGENCY_APPOINTMENT_TYPE;
                  return (
                    <label
                      key={option}
                      data-selected={isSelected ? "true" : "false"}
                      className={cn(
                        getChoiceCardClasses(presentation, isSelected),
                        presentation === "funnel" &&
                          isEmergencyOption &&
                          !isSelected &&
                          "border-rose-200 hover:border-rose-300 hover:bg-rose-50/40",
                        presentation === "funnel" &&
                          isEmergencyOption &&
                          isSelected &&
                          "border-rose-300 bg-rose-50",
                      )}
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
                      {presentation === "funnel" && isEmergencyOption ? (
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                          <PhoneCall className="h-3 w-3" aria-hidden="true" />
                          Urgent
                        </span>
                      ) : null}
                    </label>
                  );
                })}
              </RadioGroup>
            </FormControl>
            {presentation === "funnel" && field.value === EMERGENCY_APPOINTMENT_TYPE ? (
              <p className="mt-2 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">
                <PhoneCall className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                  We&apos;ll prioritize the earliest opening. In severe pain or
                  bleeding?{" "}
                  <a
                    href={`tel:${officeInfo.phoneE164}`}
                    className="font-semibold underline underline-offset-2"
                  >
                    Call {officeInfo.phone}
                  </a>{" "}
                  now.
                </span>
              </p>
            ) : null}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="schedulingMode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How would you like to schedule?</FormLabel>
            <FormControl>
              <RadioGroup
                className={cn(
                  presentation === "funnel" ? "grid gap-2.5 sm:grid-cols-2" : "grid grid-cols-1 gap-2 sm:grid-cols-2",
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
                        <span className="flex items-start gap-3">
                          <FeatureIcon icon={Icon} size="sm" className="mt-0.5" />
                          <span>
                            <span className="block text-sm font-semibold leading-6 text-slate-900">
                              {meta.title}
                            </span>
                            <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                              {meta.description}
                            </span>
                          </span>
                        </span>
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

const PreferenceStep = ({ control, presentation }: StepProps) => {
  return (
    <div className={cn(presentation === "funnel" ? "space-y-7" : "space-y-6")}>
      <FormField
        control={control}
        name="preferredDays"
        render={({ field }) => {
          const values: Array<(typeof preferredDayOptions)[number]> = field.value ?? [];
          return (
            <FormItem>
              <FormLabel>Preferred days (up to 3)</FormLabel>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
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
              <p className="text-xs text-slate-500">
                Wednesday visits end by 3:00 PM, Friday by 4:00 PM.
              </p>
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
            <FormLabel>Preferred time of day</FormLabel>
            <FormControl>
              <RadioGroup
                className={cn(presentation === "funnel" ? "grid gap-2.5 sm:grid-cols-2" : "grid grid-cols-1 gap-2")}
                value={field.value}
                onValueChange={field.onChange}
                aria-label="Preferred time of day"
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
    </div>
  );
};

type ContactStepProps = StepProps & {
  remainingNotesCharacters: number;
};

const ContactStep = ({
  control,
  presentation,
  remainingNotesCharacters,
}: ContactStepProps) => {
  return (
    <div className={cn(presentation === "funnel" ? "space-y-6" : "space-y-6")}>
      <div
        className={cn(
          "grid md:grid-cols-2",
          presentation === "funnel" ? "gap-4" : "gap-4",
        )}
      >
        <FormField
          control={control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
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
              <FormLabel>Last name</FormLabel>
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
          presentation === "funnel" ? "gap-4" : "gap-4",
        )}
      >
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
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
                  onChange={(event) =>
                    field.onChange(formatPhoneInput(event.target.value))
                  }
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
            <FormLabel>Best way to reach you</FormLabel>
            <FormControl>
              <RadioGroup
                className={cn(
                  presentation === "funnel" ? "grid grid-cols-2 gap-2.5" : "grid grid-cols-1 gap-2 sm:grid-cols-2",
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
                          <FeatureIcon icon={Icon} size="sm" />
                          <span className="mt-2 block text-sm font-semibold capitalize leading-5 text-slate-900">
                            {option}
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">
                            {contactPreferenceHints[option] ?? ""}
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

      <OptionalDetailsFields
        control={control}
        presentation={presentation}
        remainingNotesCharacters={remainingNotesCharacters}
        collapsible={presentation === "funnel"}
      />
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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shouldFocusHeadingRef = useRef(false);
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
    setValue,
    handleSubmit,
    watch,
    formState: { isSubmitting },
    reset,
  } = form;

  const formValues = watch();
  const schedulingMode = formValues.schedulingMode;

  // Emergency is derived from the appointment type — one concept, one control.
  useEffect(() => {
    const shouldFlag = formValues.appointmentType === EMERGENCY_APPOINTMENT_TYPE;
    if (formValues.isEmergency !== shouldFlag) {
      setValue("isEmergency", shouldFlag);
    }
  }, [formValues.appointmentType, formValues.isEmergency, setValue]);

  const steps: StepConfig[] = useMemo(() => {
    const visit: StepConfig = {
      name: "visit_needs",
      title: "What do you need?",
      description: "Tell us the visit type and how you'd like to schedule.",
      fields: visitNeedsFields,
    };
    const when: StepConfig = {
      name: "scheduling_preferences",
      title: "When works for you?",
      description: "Share a few days and a time window that fit your schedule.",
      fields: preferenceFields,
    };
    const contact: StepConfig = {
      name: "contact_details",
      title: "How can we reach you?",
      description: "We'll only use this to confirm your visit.",
      fields: contactFields,
    };
    return schedulingMode === "choose_preferences"
      ? [visit, when, contact]
      : [visit, contact];
  }, [schedulingMode]);

  const totalSteps = steps.length;
  const activeStep = Math.min(step, totalSteps);
  const currentStep = steps[activeStep - 1];
  const isFinalStep = activeStep === totalSteps;
  const notesValue = formValues.message || "";
  const remainingNotesCharacters = Math.max(300 - notesValue.length, 0);

  const pageContext = useMemo(
    () =>
      getAnalyticsPageContext(
        typeof window !== "undefined" ? window.location.pathname : "/schedule",
      ),
    [],
  );

  const analyticsContext = useMemo(
    () => ({
      ...pageContext,
      device_type: getDeviceType(),
      scheduling_mode: formValues.schedulingMode,
      appointment_type: formValues.appointmentType || "unselected",
      is_emergency: formValues.isEmergency ? "true" : "false",
    }),
    [
      formValues.appointmentType,
      formValues.isEmergency,
      formValues.schedulingMode,
      pageContext,
    ],
  );

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
      trackAnalyticsEvent(ANALYTICS_EVENTS.scheduleStart, {
        source: "schedule_page_form",
        ...analyticsContext,
      });
    }
  }, [analyticsContext]);

  useEffect(() => {
    const stepKey = `${activeStep}:${currentStep.name}:${totalSteps}`;
    if (lastStepViewRef.current === stepKey) {
      return;
    }
    stepTrackingRef.current = {
      index: activeStep,
      name: currentStep.name,
    };
    lastStepViewRef.current = stepKey;
    trackGAEvent("schedule_step_view", {
      source: "schedule_page_form",
      step_index: activeStep,
      step_name: currentStep.name,
      total_steps: totalSteps,
      ...analyticsContext,
    });
  }, [analyticsContext, activeStep, currentStep.name, totalSteps]);

  // Move focus to the step heading after a *user-initiated* step change so
  // keyboard / screen-reader users are told the step advanced. Gated on an
  // explicit flag (set by the nav handlers) rather than a mount guard, so it
  // never fires on mount — which would scroll the page to the form, and which
  // React Strict Mode's double-invoked mount effects would otherwise trigger.
  useEffect(() => {
    if (!shouldFocusHeadingRef.current) {
      return;
    }
    shouldFocusHeadingRef.current = false;
    headingRef.current?.focus();
  }, [activeStep]);

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
        const tracked = stepTrackingRef.current;
        trackGAEvent("schedule_abandonment_checkpoint", {
          source: "schedule_page_form",
          seconds_elapsed: seconds,
          step_index: tracked.index,
          step_name: tracked.name,
          scheduling_mode: currentValues.schedulingMode,
          appointment_type: currentValues.appointmentType || "unselected",
          is_emergency: currentValues.isEmergency ? "true" : "false",
          device_type: getDeviceType(),
          ...pageContext,
        });
      }, seconds * 1000),
    );

    return () => {
      abandonmentTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      abandonmentTimersRef.current = [];
    };
  }, [getValues, pageContext]);

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
        step_name: currentStep.name,
        ...analyticsContext,
      });
    }
  };

  const goToNextStep = async () => {
    const currentFields = currentStep.fields;
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
      step_name: currentStep.name,
      total_steps: totalSteps,
      ...analyticsContext,
    });
    shouldFocusHeadingRef.current = true;
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
      step_name: currentStep.name,
      ...analyticsContext,
    });
    shouldFocusHeadingRef.current = true;
    setStep(activeStep - 1);
  };

  const goToStepByName = (name: StepName) => {
    const index = steps.findIndex((entry) => entry.name === name);
    if (index >= 0) {
      setErrorSummary([]);
      shouldFocusHeadingRef.current = true;
      setStep(index + 1);
    }
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
      step_name: currentStep.name,
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
        contact_preference: rawData.contactPreference,
        ...analyticsContext,
      });

      trackLeadConversion(ANALYTICS_EVENTS.appointmentRequestSubmit, {
        form_name: "schedule_request_form",
        lead_type: "appointment_request",
        lead_source: "schedule_request_form",
        appointment_type: rawData.appointmentType,
        scheduling_mode: rawData.schedulingMode,
        urgent_flag: rawData.isEmergency ? "true" : "false",
        contact_preference: rawData.contactPreference,
        ...pageContext,
      });

      trackGAEvent("schedule_submit", {
        appointment_type: rawData.appointmentType,
        insurance_status: rawData.insuranceProvider ? "provided" : "not_provided",
        urgent_flag: rawData.isEmergency ? "true" : "false",
      });

      if (rawData.isEmergency) {
        trackGAEvent("schedule_submit_emergency", {
          appointment_type: rawData.appointmentType,
          insurance_status: rawData.insuranceProvider ? "provided" : "not_provided",
          urgent_flag: "true",
        });
      }

      if (rawData.appointmentType === "New Patient Exam & Cleaning") {
        trackGAEvent("schedule_submit_new_patient", {
          appointment_type: rawData.appointmentType,
          insurance_status: rawData.insuranceProvider ? "provided" : "not_provided",
          urgent_flag: rawData.isEmergency ? "true" : "false",
        });
      }

      if (rawData.appointmentType === "Invisalign Consultation") {
        trackGAEvent("schedule_submit_invisalign", {
          appointment_type: rawData.appointmentType,
          insurance_status: rawData.insuranceProvider ? "provided" : "not_provided",
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
      trackAnalyticsEvent(ANALYTICS_EVENTS.scheduleSubmitFailure, {
        source: "schedule_page_form",
        reason: getScheduleFailureReason(error),
        ...analyticsContext,
      });
      setStatus("error");
    }
  };

  const onInvalidSubmit = () => {
    const errors = updateErrorSummary(currentStep.fields);
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

  const progressPercent = Math.round((activeStep / totalSteps) * 100);
  const formClasses = cn(
    presentation === "funnel" ? "space-y-7" : "space-y-6",
    className,
  );
  const reviewDays =
    formValues.preferredDays && formValues.preferredDays.length > 0
      ? formValues.preferredDays.join(", ")
      : "Any day";
  const reviewTime = formValues.preferredTime || "Any time";

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
        className={formClasses}
        autoComplete="on"
      >
        {presentation === "funnel" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                Step {activeStep} of {totalSteps}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
                Secure request
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`Step ${activeStep} of ${totalSteps}`}
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-2xl font-semibold tracking-tight text-slate-950 outline-none sm:text-[26px]"
              >
                {currentStep.title}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">
                {currentStep.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Step {activeStep} of {totalSteps}
            </p>
            <h4
              ref={headingRef}
              tabIndex={-1}
              className="mt-1 text-lg font-semibold text-[#333333] outline-none"
            >
              {currentStep.title}
            </h4>
            <p className="mt-1 text-sm text-slate-600">{currentStep.description}</p>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`Step ${activeStep} of ${totalSteps}`}
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {currentStep.name === "visit_needs" ? (
          <VisitNeedsStep control={control} presentation={presentation} />
        ) : null}
        {currentStep.name === "scheduling_preferences" ? (
          <PreferenceStep control={control} presentation={presentation} />
        ) : null}
        {currentStep.name === "contact_details" ? (
          <ContactStep
            control={control}
            presentation={presentation}
            remainingNotesCharacters={remainingNotesCharacters}
          />
        ) : null}

        {isFinalStep ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Review your request
            </p>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <dt className="text-slate-500">Visit</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">
                    {formValues.appointmentType || "Not selected yet"}
                    {formValues.isEmergency ? (
                      <span className="ml-2 inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                        Urgent
                      </span>
                    ) : null}
                  </dd>
                </div>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => goToStepByName("visit_needs")}
                  className="h-auto shrink-0 gap-1 p-0 text-xs font-semibold text-primary no-underline hover:underline"
                >
                  <Pencil className="h-3 w-3" aria-hidden="true" />
                  Edit
                </Button>
              </div>
              <div className="flex items-start justify-between gap-3 border-t border-slate-200 pt-3">
                <div className="min-w-0">
                  <dt className="text-slate-500">Scheduling</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">
                    {schedulingMode === "first_available"
                      ? "First available opening"
                      : `${reviewDays} · ${reviewTime}`}
                  </dd>
                </div>
                <Button
                  type="button"
                  variant="link"
                  onClick={() =>
                    goToStepByName(
                      schedulingMode === "first_available"
                        ? "visit_needs"
                        : "scheduling_preferences",
                    )
                  }
                  className="h-auto shrink-0 gap-1 p-0 text-xs font-semibold text-primary no-underline hover:underline"
                >
                  <Pencil className="h-3 w-3" aria-hidden="true" />
                  Edit
                </Button>
              </div>
            </dl>
          </div>
        ) : null}

        {errorSummary.length > 0 ? (
          <div
            className="rounded-lg border border-amber-200 bg-amber-50/90 p-3 text-sm text-amber-950"
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
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="order-2 text-xs leading-5 text-slate-500 sm:order-1">
              {isFinalStep
                ? "We'll confirm by phone or email within one business day."
                : "Most patients finish in under a minute."}
            </p>
            <div className="order-1 flex gap-2 sm:order-2 sm:min-w-[300px] sm:justify-end">
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
              ) : null}
              {isFinalStep ? (
                <Button
                  type="submit"
                  className="ui-btn-primary min-h-11 flex-1 text-base font-semibold sm:min-w-[200px]"
                  disabled={isSubmitting || status === "submitting"}
                >
                  {isSubmitting || status === "submitting"
                    ? "Submitting..."
                    : "Request My Appointment"}
                </Button>
              ) : (
                <Button
                  type="button"
                  className="ui-btn-primary min-h-11 flex-1 text-base font-semibold sm:min-w-[180px]"
                  onClick={goToNextStep}
                  disabled={isSubmitting || status === "submitting"}
                >
                  Continue
                  <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Button>
              )}
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
              <span className="text-xs text-slate-500">
                Response in one business day
              </span>
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
              {isFinalStep ? (
                <Button
                  type="submit"
                  className="ui-btn-primary min-h-11 flex-1 text-base font-semibold"
                  disabled={isSubmitting || status === "submitting"}
                >
                  {isSubmitting || status === "submitting"
                    ? "Submitting..."
                    : "Request My Appointment"}
                </Button>
              ) : (
                <Button
                  type="button"
                  className="ui-btn-primary min-h-11 flex-1 text-base font-semibold"
                  onClick={goToNextStep}
                  disabled={isSubmitting || status === "submitting"}
                >
                  Continue
                  <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
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
