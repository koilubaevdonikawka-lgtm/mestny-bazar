import { z } from "zod";

export const salesAnalyticsParamsSchema = z
  .object({
    periodStart: z.string().trim().max(40).optional(),
    periodEnd: z.string().trim().max(40).optional(),
  })
  .optional();
