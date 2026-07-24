import type { PaymentProviderStatus, PaymentResponse } from "@server/infrastructure/payments";
import type { FinikPaymentResource, FinikPaymentStatus } from "@server/infrastructure/finik/shared";

/** Maps Finik API responses to infrastructure payment responses. */
export class PaymentResponseMapper {
  toPaymentResponse(resource: FinikPaymentResource, fallbackOrderId?: string): PaymentResponse {
    const orderId =
      resource.orderId ??
      resource.fields?.orderId ??
      fallbackOrderId ??
      resource.metadata?.orderId?.toString() ??
      "";

    return Object.freeze({
      providerPaymentId: resource.id,
      orderId,
      status: mapFinikStatus(resource.status),
      amount: Number(resource.amount ?? 0),
      currency: String(resource.currency ?? "KGS"),
      paymentUrl: resource.paymentUrl ?? null,
      capturedAt: resource.capturedAt ?? undefined,
      raw: Object.freeze({ ...resource }),
    });
  }
}

function mapFinikStatus(status: FinikPaymentStatus | string | undefined): PaymentProviderStatus {
  switch (String(status ?? "PENDING").toUpperCase()) {
    case "SUCCEEDED":
    case "PAID":
      return "paid";
    case "AUTHORIZED":
      return "authorized";
    case "CAPTURED":
      return "captured";
    case "FAILED":
      return "failed";
    case "CANCELLED":
    case "CANCELED":
      return "cancelled";
    case "REFUNDED":
      return "refunded";
    case "AWAITING":
      return "awaiting";
    default:
      return "pending";
  }
}

export { mapFinikStatus };
