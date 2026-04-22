export const DEFAULT_FORMSPREE_ENDPOINT = "https://formspree.io/f/xojnrjna";

const getNormalizedEndpoint = (
  value: string | null | undefined,
): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const resolveFormspreeEndpoint = (
  ...candidates: Array<string | null | undefined>
): string => {
  for (const candidate of candidates) {
    const endpoint = getNormalizedEndpoint(candidate);
    if (endpoint) {
      return endpoint;
    }
  }

  return DEFAULT_FORMSPREE_ENDPOINT;
};

export function getPublicFormspreeEndpoint(): string {
  return resolveFormspreeEndpoint(process.env.NEXT_PUBLIC_FORM_ENDPOINT);
}

export function getScheduleFormspreeEndpoint(): string {
  return resolveFormspreeEndpoint(
    process.env.SCHEDULE_FORM_ENDPOINT,
    process.env.NEXT_PUBLIC_FORM_ENDPOINT,
  );
}
