export const DEFAULT_FORMSPREE_ENDPOINT = "https://formspree.io/f/xojnrjna";

export function getPublicFormspreeEndpoint(): string {
  return process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? DEFAULT_FORMSPREE_ENDPOINT;
}

export function getScheduleFormspreeEndpoint(): string {
  return (
    process.env.SCHEDULE_FORM_ENDPOINT ??
    process.env.NEXT_PUBLIC_FORM_ENDPOINT ??
    DEFAULT_FORMSPREE_ENDPOINT
  );
}
