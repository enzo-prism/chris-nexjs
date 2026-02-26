import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertContactMessageSchema, InsertContactMessage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { trackGAEvent } from "@/lib/analytics";
import { officeInfo } from "@/lib/data";

const ContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertContactMessage>({
    resolver: zodResolver(insertContactMessageSchema),
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
      toast({
        title: "Message sent!",
        description: "We will get back to you as soon as possible.",
        variant: "default",
      });
      trackGAEvent("generate_lead");
      form.reset();
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertContactMessage) => {
    setIsSubmitting(true);
    contactMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        autoComplete="off"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#333333] font-semibold">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jane Doe…"
                    autoComplete="name"
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
                <FormLabel className="text-[#333333] font-semibold">Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="jane.doe@example.com…"
                    type="email"
                    autoComplete="email"
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="none"
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
              <FormLabel className="text-[#333333] font-semibold">Phone Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={`${officeInfo.phone}…`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#333333] font-semibold">Subject</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                name={field.name}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="appointment">Appointment Question</SelectItem>
                  <SelectItem value="billing">Billing & Insurance</SelectItem>
                  <SelectItem value="services">Service Inquiry</SelectItem>
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
              <FormLabel className="text-[#333333] font-semibold">Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="How can we help you…?"
                  autoComplete="off"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-start gap-3 rounded-md border border-slate-200 p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25">
          <Checkbox id="contact-privacy" required className="mt-0.5" />
          <label
            htmlFor="contact-privacy"
            className="cursor-pointer text-sm leading-relaxed text-[#333333]"
          >
            I understand that my information is being collected in accordance with HIPAA privacy practices and consent to being contacted.
          </label>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-white font-semibold py-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending…" : "Send Message"}
        </Button>
      </form>
    </Form>
  );
};

export default ContactForm;
