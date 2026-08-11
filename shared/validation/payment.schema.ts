import { z } from "zod";

/**
 * Structural bounds only, for the raw JSON body Finik's webhook POSTs before
 * signature verification decides whether to trust it. Field names here are
 * the standard/common shape for this class of payment gateway — confirm
 * against Finik's real API docs (see finik.adapter.ts's own note) before the
 * first real transaction; adjusting this schema stays isolated to this file.
 */
export const finikWebhookPayloadSchema = z.object({
  id: z.string().trim().min(1),
  order_id: z.string().trim().min(1),
  status: z.string().trim().min(1),
});

export const checkPaymentStatusRequestSchema = z.object({
  orderId: z.string().uuid(),
});
