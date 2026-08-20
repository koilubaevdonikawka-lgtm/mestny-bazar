export type PaymentProviderStatus = "pending" | "awaiting" | "paid" | "failed" | "refunded";

/**
 * Our own webhook receiver path — not Finik-dictated, but a single shared
 * constant so `src/server.ts` (the literal route it intercepts) and
 * `payment.service.ts` (which must tell Finik where to POST, via
 * `Data.webhookUrl`) can never drift apart.
 */
export const FINIK_WEBHOOK_PATH = "/api/webhooks/finik";

export interface PaymentIntentDTO {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentProviderStatus;
  paymentUrl: string | null;
  providerPaymentId: string | null;
  createdAt: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  orderNumber: number;
  amount: number;
  currency: string;
  idempotencyKey: string;
  /** Where the provider redirects the customer's browser after payment (Промпт №075 item 4, "возврат пользователя"). */
  returnUrl: string;
  /** Absolute URL Finik POSTs the payment-confirmed webhook to — goes in `Data.webhookUrl` (Промпт №080). */
  webhookUrl: string;
}

/** Persisted payment record status — the durable lifecycle state in `payments`. */
export type PaymentRecordStatus =
  "pending" | "awaiting" | "paid" | "failed" | "expired" | "refunded";

/** Every step of the payment lifecycle (Промпт №075, 15-step cycle) logged to `payment_events`. */
export type PaymentEventType =
  | "created"
  | "redirect_issued"
  | "webhook_received"
  | "signature_invalid"
  | "confirmed"
  | "failed"
  | "expired"
  | "status_rechecked"
  | "rollback";

/**
 * The persisted payment record. Deliberately has no field naming the
 * provider's brand for customer-facing consumption — `provider` exists for
 * ops/admin visibility only, never rendered in customer UI (Промпт №075:
 * "название платежного провайдера не должно отображаться пользователю").
 */
export interface PaymentRecordDTO {
  id: string;
  orderId: string;
  provider: string;
  providerPaymentId: string | null;
  idempotencyKey: string;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  paymentUrl: string | null;
  expiresAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Result of checking a payment's status from the customer-facing return page. */
export interface PaymentStatusCheckDTO {
  status: PaymentRecordStatus;
  orderStatus: string;
}

/** Result of retrying payment for an order whose previous attempt never reached a terminal success (БАГ 3). */
export interface RetryPaymentResponse {
  /** Where to redirect the customer to complete payment — null should not happen for an ONLINE retry, but mirrors InitiatePaymentResult's shape rather than asserting it away. */
  paymentUrl: string | null;
}
