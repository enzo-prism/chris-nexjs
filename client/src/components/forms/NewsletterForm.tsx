import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertNewsletterSubscriptionSchema, InsertNewsletterSubscription } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { trackGAEvent } from "@/lib/analytics";
import { ArrowRight } from "lucide-react";

const NewsletterForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertNewsletterSubscription>({
    resolver: zodResolver(insertNewsletterSubscriptionSchema),
    defaultValues: {
      email: "",
    },
  });

  const subscriptionMutation = useMutation({
    mutationFn: (data: InsertNewsletterSubscription) => apiRequest("POST", "/api/newsletter", data),
    onSuccess: () => {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      trackGAEvent("generate_lead");
      form.reset();
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Error subscribing to newsletter:", error);
      toast({
        title: "Error",
        description: "There was a problem with your subscription. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertNewsletterSubscription) => {
    setIsSubmitting(true);
    subscriptionMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mb-2">
        <div className="flex rounded-full bg-white/20 p-1">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input 
                    placeholder="Your email address" 
                    type="email" 
                    className="w-full border-0 bg-transparent text-white placeholder:text-white/60 focus:ring-0 text-sm"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            size="sm"
            className="bg-white text-primary hover:bg-white/90 rounded-full px-3 min-w-[80px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting…" : (
              <span className="flex items-center">
                <span>Join</span>
                <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewsletterForm;
