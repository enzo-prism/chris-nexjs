"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Control, type FieldPath, useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, ChevronLeft, ChevronRight, PhoneCall, TriangleAlert } from "lucide-react";
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
          preferredTimeOptions.includes(value as (typeof preferredTimeOptions)[number]),
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
type StepMeta = { index: number; name: StepName; title: string; description: string };
type FieldErrorSummary = { field: FieldPath<ScheduleFormValues>; message: string };

const extractUtmParams = (url: string): Record<string, string> => {
  try {
    const parsed = new URL(url);
    const params = new URLSearchParams(parsed.search);
    const utmValues: Record<string, string> = {};

    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(
      (key) => {
        const value = params.get(key);
        if (value) {
          utmValues[key] = value;
        }
      },
    );

    return utmValues;
  } catch {
    return {};
  }
};

type AppointmentFormProps = {
  readonly className?: string;
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
  "insuranceProvider",
  "message",
];

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

type VisitNeedsStepProps = {
  control: Control<ScheduleFormValues>;
};

const VisitNeedsStep = ({ control }: VisitNeedsStepProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="isEmergency"
        render={({ field }) => (
          <FormItem>
            <label
              className="ui-focus-premium flex min-h-11 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition-[border-color,background-color,box-shadow] hover:border-primary/40 focus-within:border-primary focus-within:shadow-[var(--ui-focus-shadow)]"
            >
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  id="appointment-emergency"
                  aria-describedby="appointment-emergency-help"
                  className="h-5 w-5"
                />
              </FormControl>
              <div className="text-sm text-[#333333]">
                <Label
                  htmlFor="appointment-emergency"
                  className="font-semibold leading-relaxed"
                >
                  I&apos;m in pain or need urgent care
                </Label>
                <p
                  id="appointment-emergency-help"
                  className="mt-1 text-xs text-slate-500"
                >
                  Select this and we&apos;ll prioritize your request.
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
            <FormLabel>Appointment Type</FormLabel>
            <FormControl>
              <RadioGroup
                className="grid gap-2"
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
                      className="ui-chip-interactive flex min-h-11 cursor-pointer items-center justify-start px-4 py-3 text-sm font-medium focus-within:border-primary focus-within:shadow-[var(--ui-focus-shadow)]"
                    >
                      <RadioGroupItem
                        value={option}
                        id={`appointment-type-${option.replace(/\W+/g, "-").toLowerCase()}`}
                        className="sr-only"
                      />
                      <span>{option}</span>
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
            <FormLabel>Scheduling Preference</FormLabel>
            <FormControl>
              <RadioGroup
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                value={field.value}
                onValueChange={field.onChange}
                aria-label="Scheduling preference"
              >
                <label
                  data-selected={field.value === "first_available" ? "true" : "false"}
                  className="ui-chip-interactive flex min-h-11 cursor-pointer items-center justify-start px-4 py-3 text-sm font-medium focus-within:border-primary focus-within:shadow-[var(--ui-focus-shadow)]"
                >
                  <RadioGroupItem
                    value="first_available"
                    id="scheduling-mode-first-available"
                    className="sr-only"
                  />
                  <span>Give me the first available opening</span>
                </label>
                <label
                  data-selected={field.value === "choose_preferences" ? "true" : "false"}
                  className="ui-chip-interactive flex min-h-11 cursor-pointer items-center justify-start px-4 py-3 text-sm font-medium focus-within:border-primary focus-within:shadow-[var(--ui-focus-shadow)]"
                >
                  <RadioGroupItem
                    value="choose_preferences"
                    id="scheduling-mode-choose-preferences"
                    className="sr-only"
                  />
                  <span>I want to choose preferred days and times</span>
                </label>
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
};

const ContactStep = ({ control }: ContactStepProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
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
                  className="h-11"
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
                  className="h-11"
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
                className="h-11"
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
                className="h-11"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contactPreference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Contact Method</FormLabel>
            <FormControl>
              <RadioGroup
                className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                value={field.value}
                onValueChange={field.onChange}
                aria-label="Preferred contact method"
              >
                {contactPreferenceOptions.map((option) => {
                  const isSelected = field.value === option;
                  return (
                    <label
                      key={option}
                      data-selected={isSelected ? "true" : "false"}
                      className="ui-chip-interactive flex min-h-11 cursor-pointer items-center justify-center px-3 py-3 text-sm font-medium capitalize focus-within:border-primary focus-within:shadow-[var(--ui-focus-shadow)]"
                    >
                      <RadioGroupItem
                        value={option}
                        id={`contact-preference-${option}`}
                        className="sr-only"
                      />
                      <span>{option}</span>
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

type PreferenceStepProps = {
  control: Control<ScheduleFormValues>;
  remainingNotesCharacters: number;
};

const PreferenceStep = ({ control, remainingNotesCharacters }: PreferenceStepProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="preferredDays"
        render={({ field }) => {
          const values: Array<(typeof preferredDayOptions)[number]> = field.value ?? [];
          return (
            <FormItem>
              <FormLabel>Preferred Days (choose up to 3)</FormLabel>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {preferredDayOptions.map((day) => {
                  const checked = values.includes(day);
                  return (
                    <label
                      key={day}
                      htmlFor={`preferred-day-${day}`}
                      data-selected={checked ? "true" : "false"}
                      className="ui-chip-interactive flex min-h-11 cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium focus-within:border-primary focus-within:shadow-[var(--ui-focus-shadow)]"
                    >
                      <span>{day}</span>
                      <Checkbox
                        id={`preferred-day-${day}`}
                        checked={checked}
                        onCheckedChange={(checkedValue) => {
                          const nextValues = checkedValue
                            ? [...new Set([...values, day])].slice(0, 3)
                            : values.filter((value) => value !== day);
                          field.onChange(nextValues);
                        }}
                        className="h-5 w-5"
                      />
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">
                Friday appointments are available through early afternoon.
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
            <FormLabel>Preferred Time of Day</FormLabel>
            <FormControl>
              <RadioGroup
                className="grid grid-cols-1 gap-2"
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
                      className="ui-chip-interactive flex min-h-11 cursor-pointer items-center justify-start px-4 py-3 text-sm font-medium focus-within:border-primary focus-within:shadow-[var(--ui-focus-shadow)]"
                    >
                      <RadioGroupItem
                        value={option}
                        id={`preferred-time-${option.replace(/\W+/g, "-").toLowerCase()}`}
                        className="sr-only"
                      />
                      <span>{option}</span>
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
                className="h-11"
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
                placeholder="Share anything helpful (pain, referral, treatment goals, insurance details, etc.)"
                maxLength={300}
                rows={4}
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
};

const AppointmentForm = ({ className = "" }: AppointmentFormProps) => {
  const [step, setStep] = useState<number>(1);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorSummary, setErrorSummary] = useState<FieldErrorSummary[]>([]);
  const hasTrackedStart = useRef(false);
  const hasTrackedView = useRef(false);
  const completionStateRef = useRef(false);
  const abandonmentTimersRef = useRef<number[]>([]);
  const lastStepViewRef = useRef<string>("");
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

  if (status === "success") {
    return (
      <div
        className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 text-center"
        role="status"
      >
        <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-[#164f37]">
          Thanks — we&apos;ll be in touch shortly.
        </h3>
        <p className="mt-3 text-sm text-[#145a2f]">
          Our team will call or text you within one business day to confirm your appointment.
        </p>
        <p className="mt-4 text-lg font-semibold text-[#0f3f2a]">
          Call us anytime at <a href={`tel:${officeInfo.phoneE164}`}>{officeInfo.phone}</a>
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={className ? `space-y-6 ${className}` : "space-y-6"}
        autoComplete="on"
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Step {activeStep} of {totalSteps}
          </p>
          <h4 className="mt-1 text-lg font-semibold text-[#333333]">{stepMeta.title}</h4>
          <p className="mt-1 text-sm text-slate-600">{stepMeta.description}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${(activeStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {activeStep === 1 ? <VisitNeedsStep control={control} /> : null}
        {activeStep === 2 ? <ContactStep control={control} /> : null}
        {activeStep === 3 ? (
          <PreferenceStep
            control={control}
            remainingNotesCharacters={remainingNotesCharacters}
          />
        ) : null}

        {errorSummary.length > 0 ? (
          <div
            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
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
            <span className="text-xs text-slate-500">Response in one business day</span>
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
                  ? "Submitting…"
                  : "Request My Appointment"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};

export default AppointmentForm;
