import type { PaymentStatus } from "@server/application/payment-management/models/payment.model";

export interface IPaymentEventPublisher {
  publishPaymentCreated(paymentId: string, orderId: string, customerId: string): Promise<void>;
  publishPaymentSucceeded(paymentId: string, orderId: string): Promise<void>;
  publishPaymentFailed(paymentId: string, orderId: string, reason?: string): Promise<void>;
  publishPaymentCancelled(paymentId: string, orderId: string): Promise<void>;
  publishStatusChanged(
    paymentId: string,
    status: PaymentStatus,
    previousStatus: PaymentStatus | null,
  ): Promise<void>;
}
