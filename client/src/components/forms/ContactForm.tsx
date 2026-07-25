import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { insertContactMessageSchema, InsertContactMessage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trackLeadConversion } from "@/lib/analytics";
import { officeInfo } from "@/lib/data";
import { ANALYTICS_EVENTS, getAnalyticsPageContext } from "@shared/analytics";
import { HONEYPOT_FIELD } from "@shared/formspree";
import { Link } from "wouter";

const contactFormSchema = insertContactMessageSchema.extend({
  fullName: z.string().trim().min(1, "Enter your full name."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  phone: z.string().trim().min(1, "Enter your phone number."),
  subject: z.string().trim().min(1, "Choose what you need help with."),
  message: z.string().trim().min(1, "Enter a short message."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;
type SubmissionState = "idle" | "validation-error" | "submitting" | "error" | "success";

const ContactForm = () => {
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const privacyRef = useRef<HTMLButtonElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: (data: InsertContactMessage) => apiRequest("POST", "/api/contact", data),
    onSuccess: () => {
      trackLeadConversion(ANALYTICS_EVENTS.contactFormSubmit, {
        form_name: "contact_form",
        lead_type: "contact_request",
        lead_source: "contact_form",
        ...getAnalyticsPageContext(
          typeof window !== "undefined" ? window.location.pathname : "/contact",
        ),
      });
      form.reset();
      setPrivacyConsent(false);
      setSubmissionState("success");
      // Land on the dedicated confirmation page: a stable conversion
      // page-view for GA4/Ads goals (gtag uses beacon transport, so the
      // events above survive the navigation).
      if (typeof window !== "undefined") {
        window.setTimeout(() => window.location.assign("/thank-you"), 500);
      }
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      setSubmissionState("error");
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    if (!privacyConsent) {
      setPrivacyError(true);
      setSubmissionState("validation-error");
      window.requestAnimationFrame(() => privacyRef.current?.focus());
      return;
    }

    setPrivacyError(false);
    setSubmissionState("submitting");
    contactMutation.mutate({
      ...data,
      [HONEYPOT_FIELD]: honeypotRef.current?.value ?? "",
    } as InsertContactMessage);
  };

  const onInvalid = () => {
    if (!privacyConsent) setPrivacyError(true);
    setSubmissionState("validation-error");
  };

  const retrySubmission = () => {
    void form.handleSubmit(onSubmit, onInvalid)();
  };

  const isSubmitting = submissionState === "submitting";
  const isSuccess = submissionState === "success";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-5"
        autoComplete="on"
        noValidate
        data-hj-suppress
        aria-describedby="contact-form-guidance"
      >
        {/* Honeypot — hidden from real users; bots that fill it are dropped. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="contact-company">Company</label>
          <Input
            ref={honeypotRef}
            id="contact-company"
            type="text"
            name={HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <p id="contact-form-guidance" className="text-sm leading-6 text-slate-600">
          All fields are required. We usually reply within one business day.
        </p>

        {submissionState === "validation-error" ? (
          <div
            ref={errorSummaryRef}
            role="alert"
            tabIndex={-1}
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            Please review the highlighted fields, then send your message again.
          </div>
        ) : null}

        {submissionState === "error" ? (
          <div
            ref={errorSummaryRef}
            role="alert"
            tabIndex={-1}
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            <p className="font-semibold">We could not send your message.</p>
            <p className="mt-1">
              Your entries are still here. Try again, or call{" "}
              <a className="ui-link-premium" href={`tel:${officeInfo.phoneE164}`}>
                {officeInfo.phone}
              </a>
              .
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={retrySubmission}
            >
              <RotateCcw aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : null}

        {isSuccess ? (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
            Message sent. Opening your confirmation…
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-[#333333]">Full name</FormLabel>
                <FormControl>
                  <Input
                    enterKeyHint="next"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    required
                    className="min-h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-[#333333]">Email address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    inputMode="email"
                    enterKeyHint="next"
                    autoComplete="email"
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="none"
                    placeholder="jane.doe@example.com"
                    required
                    className="min-h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-[#333333]">Phone number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  enterKeyHint="next"
                  autoComplete="tel"
                  placeholder="e.g., (650) 555-0123"
                  required
                  className="min-h-11"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We will use this only to respond to your request.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-[#333333]">
                What can we help with?
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                name={field.name}
                required
              >
                <FormControl>
                  <SelectTrigger ref={field.ref} className="min-h-11">
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="appointment">Appointment or scheduling question</SelectItem>
                  <SelectItem value="billing">Billing or insurance</SelectItem>
                  <SelectItem value="services">Services and treatment options</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-[#333333]">Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us how we can help."
                  autoComplete="off"
                  rows={5}
                  required
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Keep this general. Do not include symptoms, diagnoses, medications, or other
                private health details.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div
          className={`ui-focus-premium flex items-start gap-3 rounded-xl border p-4 transition-[border-color,background-color,box-shadow] focus-within:shadow-[var(--ui-focus-shadow)] ${
            privacyError
              ? "border-red-400 bg-red-50/70"
              : "border-slate-200 bg-slate-50/60 hover:border-primary/35 focus-within:border-primary"
          }`}
        >
          <Checkbox
            ref={privacyRef}
            id="contact-privacy"
            checked={privacyConsent}
            onCheckedChange={(checked) => {
              const nextChecked = checked === true;
              setPrivacyConsent(nextChecked);
              if (nextChecked) setPrivacyError(false);
            }}
            required
            aria-invalid={privacyError}
            aria-describedby={
              privacyError
                ? "contact-privacy-description contact-privacy-error"
                : "contact-privacy-description"
            }
            className="mt-1 h-5 w-5"
          />
          <div className="min-w-0">
            <label
              htmlFor="contact-privacy"
              className="cursor-pointer text-sm font-semibold leading-6 text-[#333333]"
            >
              I agree that the office may contact me about this request.
            </label>
            <p id="contact-privacy-description" className="mt-1 text-sm leading-6 text-slate-600">
              This form is for general questions only. Read our{" "}
              <Link className="ui-link-premium" href="/privacy-policy">
                privacy policy
              </Link>{" "}
              and{" "}
              <Link className="ui-link-premium" href="/hipaa">
                HIPAA notice
              </Link>
              .
            </p>
            {privacyError ? (
              <p id="contact-privacy-error" className="mt-1 text-sm font-medium text-red-700">
                Please agree before sending your message.
              </p>
            ) : null}
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="ui-btn-primary min-h-12 w-full rounded-xl py-3 text-base font-semibold"
          disabled={isSubmitting || isSuccess}
          aria-describedby="contact-submit-note"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Sending message…
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 aria-hidden="true" />
              Message sent
            </>
          ) : (
            "Send message"
          )}
        </Button>
        <p id="contact-submit-note" className="text-center text-xs leading-5 text-slate-500">
          Please call the office instead for urgent dental needs.
        </p>
      </form>
    </Form>
  );
};

export default ContactForm;
