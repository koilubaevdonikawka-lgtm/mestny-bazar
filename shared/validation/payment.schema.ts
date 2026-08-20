import { z } from "zod";

/**
 * Structural bounds only, for the raw JSON body Finik's webhook POSTs before
 * signature verification decides whether to trust it. Real shape confirmed
 * by the project owner from Finik's official documentation (Промпт №080) —
 * supersedes the earlier `{id, order_id, status}` guess (Промпт №075): there
 * is no `order_id` at the top level at all — our own payment is identified
 * via `fields.paymentId` (the `PaymentId` we chose and sent in
 * `createPayment`'s request body). `transactionId` is Finik's own delivery
 * identifier (falls back to `id` when absent — Finik's docs mark it as not
 * always present) and is what redelivery dedup keys off (webhook-handler.ts).
 */
export const finikWebhookPayloadSchema = z.object({
  id: z.string().trim().min(1),
  transactionId: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1),
  amount: z.number().optional(),
  requestDate: z.string().optional(),
  transactionDate: z.string().optional(),
  service: z.string().optional(),
  fields: z.object({
    paymentId: z.string().trim().min(1),
    amount: z.number().optional(),
  }),
});

export const checkPaymentStatusRequestSchema = z.object({
  orderId: z.string().uuid(),
});
