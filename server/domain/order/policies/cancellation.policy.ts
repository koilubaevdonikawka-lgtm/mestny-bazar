import type { OrderPolicySnapshot } from "@server/domain/order/policies/payment.policy";
import { OrderLifecycleStatus as Status } from "@server/domain/order/status/order-status";
import { isTerminalOrderStatus } from "@server/domain/order/status/order-status";

/** Cancellation permissions. */
export class CancellationPolicy {
  canCancel(snapshot: OrderPolicySnapshot): boolean {
    if (isTerminalOrderStatus(snapshot.status)) {
      return false;
    }

    return (
      snapshot.status === Status.Draft ||
      snapshot.status === Status.PendingPayment ||
      snapshot.status === Status.Paid ||
      snapshot.status === Status.Preparing ||
      snapshot.status === Status.ReadyForDelivery ||
      snapshot.status === Status.Delivering
    );
  }

  canModifyItems(snapshot: OrderPolicySnapshot): boolean {
    return snapshot.status === Status.Draft;
  }

  canClose(snapshot: OrderPolicySnapshot): boolean {
    return (
      snapshot.status === Status.Completed ||
      snapshot.status === Status.Cancelled ||
      snapshot.status === Status.Refunded
    );
  }
}
