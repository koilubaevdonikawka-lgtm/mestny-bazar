import { z } from "zod";

export const createPayoutRunRequestSchema = z.object({
  sellerId: z.string().uuid(),
  periodStart: z.string().trim().min(1).max(40),
  periodEnd: z.string().trim().min(1).max(40),
});

export const payoutIdSchema = z.object({
  id: z.string().uuid(),
});
