import { z } from "zod";

import { LEAD_CHANNELS } from "./attribution";

// Server-side validation for the optional attribution object on lead payloads.
export const leadAttributionSchema = z.object({
  channel: z.enum(LEAD_CHANNELS),
  landingPath: z.string().trim().max(200).optional(),
  referrerHost: z.string().trim().max(120).optional(),
});
