import type { ApplicationDomainEvent } from "@server/application/shared";
import type { FinikWebhookPayload } from "@server/infrastructure/finik/shared";

/** Maps Finik webhook payloads to application domain event envelopes. */
export class WebhookEventMapper {
  toDomainEvents(payload: FinikWebhookPayload): ApplicationDomainEvent[] {
    const orderId = payload.fields?.orderId;
    if (!orderId) {
      return [];
    }

    const occurredAt = payload.occurredAt ?? new Date().toISOString();
    const status = String(payload.status).toUpperCase();

    if (status === "SUCCEEDED" || status === "PAID") {
      return [
        Object.freeze({
          eventName: "order.paid",
          occurredAt,
          aggregateId: orderId,
          aggregateType: "order",
          payload: Object.freeze({
            providerPaymentId: payload.id,
            previousStatus: "PendingPayment",
            paymentMethod: "online",
            totalAmount: payload.amount ?? 0,
            currency: payload.currency ?? "KGS",
            transactionId: payload.transactionId,
            source: "finik.webhook",
          }),
        }),
      ];
    }

    if (status === "FAILED") {
      return [
        Object.freeze({
          eventName: "order.payment_failed",
          occurredAt,
          aggregateId: orderId,
          aggregateType: "order",
          payload: Object.freeze({
            providerPaymentId: payload.id,
            source: "finik.webhook",
          }),
        }),
      ];
    }

    if (status === "REFUNDED") {
      return [
        Object.freeze({
          eventName: "order.refunded",
          occurredAt,
          aggregateId: orderId,
          aggregateType: "order",
          payload: Object.freeze({
            providerPaymentId: payload.id,
            reason: "finik_webhook_refund",
            source: "finik.webhook",
          }),
        }),
      ];
    }

    return [];
  }
}

export type { FinikWebhookPayload };
