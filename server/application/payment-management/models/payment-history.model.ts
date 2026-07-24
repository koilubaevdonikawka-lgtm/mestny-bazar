import type { PaymentStatus } from "@server/application/payment-management/models/payment.model";

export interface PaymentHistoryEntry {
  readonly id: string;
  readonly paymentId: string;
  readonly status: PaymentStatus;
  readonly previousStatus: PaymentStatus | null;
  readonly reason: string | null;
  readonly actor: string | null;
  readonly occurredAt: string;
}

export function createPaymentHistoryEntry(input: {
  id: string;
  paymentId: string;
  status: PaymentStatus;
  previousStatus?: PaymentStatus | null;
  reason?: string | null;
  actor?: string | null;
  occurredAt?: string;
}): PaymentHistoryEntry {
  return Object.freeze({
    id: input.id.trim(),
    paymentId: input.paymentId.trim(),
    status: input.status,
    previousStatus: input.previousStatus ?? null,
    reason: input.reason?.trim() ?? null,
    actor: input.actor?.trim() ?? null,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  });
}

export interface PaymentHistoryView {
  readonly paymentId: string;
  readonly entries: readonly PaymentHistoryEntry[];
}

export interface CancelPaymentResult {
  readonly cancelled: boolean;
}

export interface FailPaymentResult {
  readonly failed: boolean;
}

export interface ConfirmPaymentResult {
  readonly confirmed: boolean;
  readonly paymentId: string;
  readonly status: PaymentStatus;
}
