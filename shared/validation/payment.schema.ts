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
 *
 * `requestDate`/`transactionDate` are Unix milliseconds (`number`, not a
 * date string) and `service` is `{ id: string }` (not a plain string) —
 * corrected here (Промпт №096) after Промпт №095's Шаг 0 found both typed
 * wrong against the real documented payload; with the previous `z.string()`
 * types, every genuine webhook would have failed `.parse()` before
 * signature verification ever ran, meaning payment confirmation via
 * webhook could never have worked in production. `fields` may carry
 * additional Finik-defined keys beyond `paymentId`/`amount` — zod's default
 * (non-strict) object parsing already passes those through unexamined, so
 * no further change was needed there.
 */
export const finikWebhookPayloadSchema = z.object({
  id: z.string().trim().min(1),
  transactionId: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1),
  amount: z.number().optional(),
  requestDate: z.number().optional(),
  transactionDate: z.number().optional(),
  service: z.object({ id: z.string() }).optional(),
  fields: z.object({
    paymentId: z.string().trim().min(1),
    amount: z.number().optional(),
  }),
});

export const checkPaymentStatusRequestSchema = z.object({
  orderId: z.string().uuid(),
});
