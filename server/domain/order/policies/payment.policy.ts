import type { OrderLifecycleStatus } from "@server/domain/order/status/order-status";
import { OrderLifecycleStatus as Status } from "@server/domain/order/status/order-status";
import type { PaymentMethod } from "@server/domain/order/value-objects/payment-method.vo";
import type { CustomerId } from "@server/domain/order/value-objects/customer-id.vo";

export interface OrderPolicySnapshot {
  status: OrderLifecycleStatus;
  paymentMethod: PaymentMethod;
  customerId: CustomerId;
  itemCount: number;
  courierId: string | null;
}

/** Payment permissions and constraints. */
export class PaymentPolicy {
  canPay(snapshot: OrderPolicySnapshot): boolean {
    return snapshot.status === Status.PendingPayment && snapshot.itemCount > 0;
  }

  canConfirm(snapshot: OrderPolicySnapshot): boolean {
    return snapshot.status === Status.Draft && snapshot.itemCount > 0;
  }

  requiresOnlinePayment(snapshot: OrderPolicySnapshot): boolean {
    return snapshot.paymentMethod.isOnline();
  }

  allowsCashForGuest(snapshot: OrderPolicySnapshot): boolean {
    return !snapshot.customerId.isGuest() || snapshot.paymentMethod.isCash();
  }
}
