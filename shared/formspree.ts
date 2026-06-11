export const DEFAULT_FORMSPREE_ENDPOINT = "https://formspree.io/f/xojnrjna";
export const FORMSPREE_OPS_SITE = "chris-website";
export const FORMSPREE_OPS_SCHEDULE_FORM_KEY = "schedule_request";
export const FORMSPREE_OPS_QA_FIELD = "_codex_test";

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
