import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertAppointmentSchema, InsertAppointment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { trackGAEvent } from "@/lib/analytics";
import { officeInfo } from "@/lib/data";
import { cn } from "@/lib/utils";

const AppointmentForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertAppointment>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      service: "",
      date: "",
      time: "",
      type: "in-person",
      notes: "",
    },
  });

  const appointmentMutation = useMutation({
    mutationFn: (data: InsertAppointment) => apiRequest("POST", "/api/appointments", data),
    onSuccess: () => {
      toast({
        title: "Appointment scheduled!",
        description: "You will receive a confirmation email shortly.",
        variant: "default",
      });
      trackGAEvent("booked_appointment");
      form.reset();
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Error scheduling appointment:", error);
      toast({
        title: "Error",
        description: "There was a problem scheduling your appointment. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertAppointment) => {
    setIsSubmitting(true);
    appointmentMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        autoComplete="off"
      >
        <div>
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-[#333333] font-semibold">Appointment Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    <label
                      htmlFor="in-person"
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-sm font-medium text-[#333333] transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                        field.value === "in-person" &&
                          "border-primary bg-blue-50 text-primary",
                      )}
                    >
                      <RadioGroupItem value="in-person" id="in-person" />
                      <span className="flex-1">In-Person Visit</span>
                    </label>
                    <label
                      htmlFor="virtual"
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-sm font-medium text-[#333333] transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                        field.value === "virtual" &&
                          "border-primary bg-blue-50 text-primary",
                      )}
                    >
                      <RadioGroupItem value="virtual" id="virtual" />
                      <span className="flex-1">Virtual Consultation</span>
                    </label>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#333333] font-semibold">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe…"
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
                    placeholder="john.doe@example.com…"
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

        <div className="grid md:grid-cols-2 gap-4">
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
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#333333] font-semibold">Service Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  name={field.name}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cleaning">Cleaning & Check-up</SelectItem>
                    <SelectItem value="cosmetic">Cosmetic Consultation</SelectItem>
                    <SelectItem value="emergency">Emergency Care</SelectItem>
                    <SelectItem value="orthodontics">Orthodontics</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel className="text-[#333333] font-semibold">Preferred Date & Time</FormLabel>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="date" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (1PM - 5PM)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#333333] font-semibold">Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share any specific concerns or questions…"
                  autoComplete="off"
                  rows={3}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-start gap-3 rounded-md border border-slate-200 p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25">
          <Checkbox id="privacy" required className="mt-0.5" />
          <label
            htmlFor="privacy"
            className="cursor-pointer text-sm leading-relaxed text-[#333333]"
          >
            I understand that this information is protected by HIPAA and consent to receiving communications via email and text message.
          </label>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#E63946] hover:bg-red-600 text-white font-semibold py-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Scheduling…" : "Book Appointment"}
        </Button>

        <p className="text-sm text-[#333333] text-center">
          You will receive a confirmation email once your appointment is scheduled.
        </p>
      </form>
    </Form>
  );
};

export default AppointmentForm;
