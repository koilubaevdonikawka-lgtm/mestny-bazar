import type { OrderPolicySnapshot } from "@server/domain/order/policies/payment.policy";
import { OrderLifecycleStatus as Status } from "@server/domain/order/status/order-status";

/** Refund permissions. */
export class RefundPolicy {
  canRefund(snapshot: OrderPolicySnapshot): boolean {
    return snapshot.status === Status.Completed;
  }

  requiresRefundReason(): boolean {
    return true;
  }
}
