import type { PaymentStatus } from "@server/application/payment-management/models/payment.model";

export interface IPaymentStatusProvider {
  canTransition(from: PaymentStatus, to: PaymentStatus): boolean;
  getAllowedTransitions(from: PaymentStatus): readonly PaymentStatus[];
  isTerminal(status: PaymentStatus): boolean;
}
