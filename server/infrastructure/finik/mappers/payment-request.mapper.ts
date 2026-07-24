import type { PaymentRequest } from "@server/infrastructure/payments";
import type { FinikConfiguration } from "@server/infrastructure/finik/configuration";

/** Maps infrastructure payment requests to Finik API payloads. */
export class PaymentRequestMapper {
  constructor(private readonly configuration: FinikConfiguration) {}

  toCreatePaymentBody(request: PaymentRequest): Record<string, unknown> {
    return Object.freeze({
      accountId: this.configuration.merchantId,
      amount: request.amount,
      currency: request.currency,
      callbackUrl: this.configuration.callbackUrl,
      description: request.description ?? `Order ${request.orderId}`,
      fields: Object.freeze({
        orderId: request.orderId,
        ...(request.metadata ?? {}),
      }),
      metadata: Object.freeze({
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
      }),
    });
  }

  toCaptureBody(amount?: number): Record<string, unknown> {
    return Object.freeze({
      ...(amount !== undefined ? { amount } : {}),
    });
  }

  toCancelBody(reason?: string): Record<string, unknown> {
    return Object.freeze({
      reason: reason?.trim() || "cancelled_by_merchant",
    });
  }

  toRefundBody(amount?: number, reason?: string): Record<string, unknown> {
    return Object.freeze({
      ...(amount !== undefined ? { amount } : {}),
      reason: reason?.trim() || "refund_requested",
    });
  }
}
