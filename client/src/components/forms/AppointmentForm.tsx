"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
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

const appointmentTypeOptions = [
  "New Patient Exam & Cleaning",
  "Existing Patient Checkup",
  "Invisalign Consultation",
  "Cosmetic Consultation",
  "Emergency Visit",
  "Other",
] as const;

const preferredDayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

const preferredTimeOptions = [
  "Morning (8am-11am)",
  "Midday (11am-2pm)",
  "Afternoon (2pm-5pm)",
  "First Available",
] as const;

const insuranceOptions = ["Yes", "No", "Not Sure"] as const;

const scheduleFormSchema = z.object({
  emergency: z.boolean(),
  appointmentType: z
    .string()
    .min(1, "Please select an appointment type.")
    .refine(
      (value) => appointmentTypeOptions.includes(value as (typeof appointmentTypeOptions)[number]),
      { message: "Please select an appointment type." },
    ),
  preferredDays: z.array(z.enum(preferredDayOptions)).min(1, "Pick at least one day."),
  preferredTimeOfDay: z
    .string()
    .min(1, "Please select a preferred time.")
    .refine(
      (value) => preferredTimeOptions.includes(value as (typeof preferredTimeOptions)[number]),
      { message: "Please select a preferred time." },
    ),
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(40, "First name must be 40 characters or fewer."),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(40, "Last name must be 40 characters or fewer."),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .regex(
      /^\(\d{3}\) \d{3}-\d{4}$/,
      "Phone number must be in the format (XXX) XXX-XXXX.",
    ),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email."),
  insuranceStatus: z.enum(insuranceOptions).optional().nullable(),
  additionalNotes: z
    .string()
    .trim()
    .max(300, "Additional notes must be 300 characters or fewer.")
    .optional()
    .nullable(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const formatPhoneNumber = (rawValue: string): string => {
  const digits = rawValue.replace(/\D/g, "").slice(0, 10);

  if (!digits) {
    return "";
  }

  if (digits.length <= 3) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

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

const AppointmentForm = ({ className = "" }: AppointmentFormProps) => {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const hasTrackedStart = useRef(false);
  const focusStateRef = useRef({
    appointmentType: false,
    preferredDays: false,
    preferredTimeOfDay: false,
  });

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      emergency: false,
      appointmentType: "",
      preferredDays: [],
      preferredTimeOfDay: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      insuranceStatus: undefined,
      additionalNotes: "",
    },
    mode: "onBlur",
  });

  const {
    control,
    handleSubmit,
    setFocus,
    watch,
    formState: { isSubmitting },
    reset,
  } = form;

  const selectedAppointmentType = watch("appointmentType");
  const selectedPreferredDays = watch("preferredDays");
  const selectedPreferredTimeOfDay = watch("preferredTimeOfDay");
  const notesValue = watch("additionalNotes") || "";
  const remainingNotesCharacters = Math.max(300 - notesValue.length, 0);

  useEffect(() => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      trackGAEvent("schedule_start", {
        source: "schedule_page_form",
      });
    }
  }, []);

  useEffect(() => {
    if (!focusStateRef.current.appointmentType && Boolean(selectedAppointmentType)) {
      focusStateRef.current.appointmentType = true;
      setFocus("preferredDays");
    }
  }, [selectedAppointmentType, setFocus]);

  useEffect(() => {
    if (
      !focusStateRef.current.preferredDays &&
      selectedPreferredDays.length > 0
    ) {
      focusStateRef.current.preferredDays = true;
      setFocus("preferredTimeOfDay");
    }
  }, [selectedPreferredDays, setFocus]);

  useEffect(() => {
    if (
      !focusStateRef.current.preferredTimeOfDay &&
      selectedPreferredTimeOfDay
    ) {
      focusStateRef.current.preferredTimeOfDay = true;
      setFocus("firstName");
    }
  }, [selectedPreferredTimeOfDay, setFocus]);

  const onSubmit = async (rawData: ScheduleFormValues) => {
    const sourceUrl = window.location.href;

    const payload = {
      emergency: rawData.emergency,
      appointmentType: rawData.appointmentType,
      preferredDays: rawData.preferredDays,
      preferredTimeOfDay: rawData.preferredTimeOfDay,
      firstName: rawData.firstName.trim(),
      lastName: rawData.lastName.trim(),
      phone: rawData.phone,
      email: rawData.email.trim().toLowerCase(),
      insuranceStatus: rawData.insuranceStatus,
      additionalNotes: rawData.additionalNotes?.trim() || "",
      sourceUrl,
      utmParams: extractUtmParams(sourceUrl),
    };

    setStatus("submitting");
    setErrorMessage("");

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

      trackGAEvent("schedule_submit", {
        appointment_type: rawData.appointmentType,
        insurance_status: rawData.insuranceStatus ?? "not provided",
        urgent_flag: rawData.emergency ? "true" : "false",
      });

      if (rawData.emergency) {
        trackGAEvent("schedule_submit_emergency", {
          appointment_type: rawData.appointmentType,
          insurance_status: rawData.insuranceStatus ?? "not provided",
          urgent_flag: "true",
        });
      }

      if (rawData.appointmentType === "New Patient Exam & Cleaning") {
        trackGAEvent("schedule_submit_new_patient", {
          appointment_type: rawData.appointmentType,
          insurance_status: rawData.insuranceStatus ?? "not provided",
          urgent_flag: rawData.emergency ? "true" : "false",
        });
      }

      if (rawData.appointmentType === "Invisalign Consultation") {
        trackGAEvent("schedule_submit_invisalign", {
          appointment_type: rawData.appointmentType,
          insurance_status: rawData.insuranceStatus ?? "not provided",
          urgent_flag: rawData.emergency ? "true" : "false",
        });
      }

      setStatus("success");
      reset();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
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
        <FormField
          control={control}
          name="emergency"
          render={({ field }) => (
            <FormItem>
              <label
                className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3"
              >
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(Boolean(checked));
                      setFocus("appointmentType");
                    }}
                    id="appointment-emergency"
                    aria-describedby="appointment-emergency-help"
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
                    Select this if this is urgent and we will prioritize your request.
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
                  role="radiogroup"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {appointmentTypeOptions.map((option) => {
                      const isSelected = field.value === option;
                      return (
                        <label
                          key={option}
                          className={`flex min-h-[44px] w-full cursor-pointer items-center rounded-lg border px-4 py-3 text-sm font-medium transition ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-slate-300 text-[#333333] hover:border-primary/70"
                          }`}
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
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="preferredDays"
          render={({ field }) => {
            const values = field.value ?? [];
            return (
              <FormItem>
                <FormLabel>Preferred Days</FormLabel>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {preferredDayOptions.map((day) => {
                    const checked = values.includes(day);
                    return (
                      <label
                        key={day}
                        htmlFor={`preferred-day-${day}`}
                        className={`flex min-h-[44px] cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition ${
                          checked
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-300 text-[#333333] hover:border-primary/70"
                        }`}
                      >
                        <span>{day}</span>
                        <Checkbox
                          id={`preferred-day-${day}`}
                          checked={checked}
                          onCheckedChange={(checkedValue) => {
                            const nextValues = checkedValue
                              ? [...new Set([...values, day])]
                              : values.filter((value) => value !== day);
                            field.onChange(nextValues);
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={control}
          name="preferredTimeOfDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Time of Day</FormLabel>
              <FormControl>
                <RadioGroup
                  className="grid grid-cols-1 gap-2"
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-label="Preferred Time of Day"
                  role="radiogroup"
                >
                  {preferredTimeOptions.map((option) => {
                    const isSelected = field.value === option;
                    return (
                      <label
                        key={option}
                        className={`flex min-h-[44px] cursor-pointer items-center rounded-lg border px-4 py-3 text-sm font-medium transition ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-300 text-[#333333] hover:border-primary/70"
                        }`}
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
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    maxLength={14}
                    {...field}
                    onChange={(event) => {
                      const formatted = formatPhoneNumber(event.target.value);
                      field.onChange(formatted);
                    }}
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
          name="insuranceStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you have dental insurance?</FormLabel>
              <FormControl>
                <RadioGroup
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                  value={field.value ?? ""}
                  onValueChange={(value) => field.onChange(value)}
                  aria-label="Do you have dental insurance?"
                  role="radiogroup"
                >
                  {insuranceOptions.map((option) => {
                    const isSelected = field.value === option;
                    return (
                      <label
                        key={option}
                        className={`flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border px-3 py-3 text-sm font-medium transition ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-300 text-[#333333] hover:border-primary/70"
                        }`}
                      >
                        <RadioGroupItem
                          value={option}
                          id={`insurance-${option.toLowerCase().replace(/\s+/g, "-")}`}
                          className="sr-only"
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="additionalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share anything helpful (pain, referral, insurance details, etc.)"
                    maxLength={300}
                    rows={4}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <p className="mt-1 text-xs text-slate-500">
                  Share anything helpful (pain, referral, insurance details, etc.).{" "}
                  {remainingNotesCharacters} characters left.
                </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {status === "error" && errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-12 w-full bg-primary text-base font-semibold hover:bg-primary/90"
          disabled={isSubmitting || status === "submitting"}
        >
          {isSubmitting || status === "submitting"
            ? "Submitting…"
            : "Request My Appointment"}
        </Button>
      </form>
    </Form>
  );
};

export default AppointmentForm;
