import type { Payment } from "@server/application/payment-management/models/payment.model";

export interface IPaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(paymentId: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<readonly Payment[]>;
  findAll(): Promise<readonly Payment[]>;
  update(payment: Payment): Promise<void>;
}
