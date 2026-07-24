import type { Payment } from "@server/application/modules/payment/payment/models";

/** Payment persistence contract — implemented by infrastructure adapters. */
export interface IPaymentStore {
  savePayment(payment: Payment): Promise<void>;
  updatePayment(payment: Payment): Promise<void>;
  findById(paymentId: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<Payment | null>;
  findByProviderPaymentId(providerPaymentId: string): Promise<Payment | null>;
}
