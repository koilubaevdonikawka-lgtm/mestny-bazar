import type { IPaymentEventPublisher } from "@server/application/payment-management/contracts/payment-event-publisher.contract";
import type { PaymentStatus } from "@server/application/payment-management/models/payment.model";

/** No-op event publisher until Notification BCM is connected. */
export class NoopPaymentEventPublisher implements IPaymentEventPublisher {
  async publishPaymentCreated(
    _paymentId: string,
    _orderId: string,
    _customerId: string,
  ): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishPaymentSucceeded(_paymentId: string, _orderId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishPaymentFailed(
    _paymentId: string,
    _orderId: string,
    _reason?: string,
  ): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishPaymentCancelled(_paymentId: string, _orderId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishStatusChanged(
    _paymentId: string,
    _status: PaymentStatus,
    _previousStatus: PaymentStatus | null,
  ): Promise<void> {
    // Reserved for Notification BCM integration.
  }
}
