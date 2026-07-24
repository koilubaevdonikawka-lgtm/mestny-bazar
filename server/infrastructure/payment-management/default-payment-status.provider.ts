import type { IPaymentStatusProvider } from "@server/application/payment-management/contracts/payment-status-provider.contract";
import { PaymentStatus } from "@server/application/payment-management/models/payment.model";

const TRANSITIONS: Readonly<Record<PaymentStatus, readonly PaymentStatus[]>> = Object.freeze({
  [PaymentStatus.Pending]: Object.freeze([
    PaymentStatus.Processing,
    PaymentStatus.Succeeded,
    PaymentStatus.Failed,
    PaymentStatus.Cancelled,
  ]),
  [PaymentStatus.Processing]: Object.freeze([
    PaymentStatus.Succeeded,
    PaymentStatus.Failed,
    PaymentStatus.Cancelled,
  ]),
  [PaymentStatus.Succeeded]: Object.freeze([]),
  [PaymentStatus.Failed]: Object.freeze([]),
  [PaymentStatus.Cancelled]: Object.freeze([]),
});

/** Default payment status transition rules. */
export class DefaultPaymentStatusProvider implements IPaymentStatusProvider {
  canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
    return TRANSITIONS[from].includes(to);
  }

  getAllowedTransitions(from: PaymentStatus): readonly PaymentStatus[] {
    return TRANSITIONS[from];
  }

  isTerminal(status: PaymentStatus): boolean {
    return (
      status === PaymentStatus.Succeeded ||
      status === PaymentStatus.Failed ||
      status === PaymentStatus.Cancelled
    );
  }
}
