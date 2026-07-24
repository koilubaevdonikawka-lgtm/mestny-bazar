import { CancellationPolicy } from "@server/domain/order/policies/cancellation.policy";
import {
  DeliveryPolicy,
  type OrderDeliverySnapshot,
} from "@server/domain/order/policies/delivery.policy";
import {
  PaymentPolicy,
  type OrderPolicySnapshot,
} from "@server/domain/order/policies/payment.policy";
import { RefundPolicy } from "@server/domain/order/policies/refund.policy";

/** Coordinates specialized order policies. */
export class OrderPolicy {
  private readonly payment = new PaymentPolicy();
  private readonly delivery = new DeliveryPolicy();
  private readonly cancellation = new CancellationPolicy();
  private readonly refund = new RefundPolicy();

  canConfirm(snapshot: OrderPolicySnapshot): boolean {
    return this.payment.canConfirm(snapshot);
  }

  canPay(snapshot: OrderPolicySnapshot): boolean {
    return this.payment.canPay(snapshot);
  }

  allowsCashForGuest(snapshot: OrderPolicySnapshot): boolean {
    return this.payment.allowsCashForGuest(snapshot);
  }

  canStartPreparing(snapshot: OrderPolicySnapshot): boolean {
    return this.delivery.canStartPreparing(snapshot);
  }

  canCompletePreparing(snapshot: OrderPolicySnapshot): boolean {
    return this.delivery.canCompletePreparing(snapshot);
  }

  canHandToCourier(snapshot: OrderDeliverySnapshot): boolean {
    return this.delivery.canHandToCourier(snapshot);
  }

  canStartDelivery(snapshot: OrderDeliverySnapshot): boolean {
    return this.delivery.canStartDelivery(snapshot);
  }

  canDeliver(snapshot: OrderDeliverySnapshot): boolean {
    return this.delivery.canDeliver(snapshot);
  }

  canCompletePickup(snapshot: OrderDeliverySnapshot): boolean {
    return this.delivery.canCompletePickup(snapshot);
  }

  canCancel(snapshot: OrderPolicySnapshot): boolean {
    return this.cancellation.canCancel(snapshot);
  }

  canModifyItems(snapshot: OrderPolicySnapshot): boolean {
    return this.cancellation.canModifyItems(snapshot);
  }

  canClose(snapshot: OrderPolicySnapshot): boolean {
    return this.cancellation.canClose(snapshot);
  }

  canRefund(snapshot: OrderPolicySnapshot): boolean {
    return this.refund.canRefund(snapshot);
  }
}

export { PaymentPolicy, DeliveryPolicy, CancellationPolicy, RefundPolicy };

export type { OrderPolicySnapshot, OrderDeliverySnapshot };
