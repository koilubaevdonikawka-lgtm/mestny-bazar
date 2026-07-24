import type { OrderPolicySnapshot } from "@server/domain/order/policies/payment.policy";
import { OrderLifecycleStatus as Status } from "@server/domain/order/status/order-status";
import type { DeliveryMethod } from "@server/domain/order/value-objects/delivery-method.vo";

export interface OrderDeliverySnapshot extends OrderPolicySnapshot {
  deliveryMethod: DeliveryMethod;
}

/** Delivery and fulfillment permissions. */
export class DeliveryPolicy {
  canStartPreparing(snapshot: OrderPolicySnapshot): boolean {
    return snapshot.status === Status.Paid;
  }

  canCompletePreparing(snapshot: OrderPolicySnapshot): boolean {
    return snapshot.status === Status.Preparing;
  }

  canHandToCourier(snapshot: OrderDeliverySnapshot): boolean {
    return snapshot.status === Status.ReadyForDelivery && snapshot.deliveryMethod.isCourier();
  }

  canStartDelivery(snapshot: OrderDeliverySnapshot): boolean {
    if (snapshot.status !== Status.ReadyForDelivery) {
      return false;
    }

    if (snapshot.deliveryMethod.isCourier()) {
      return snapshot.courierId !== null;
    }

    return snapshot.deliveryMethod.isPickup();
  }

  canDeliver(snapshot: OrderDeliverySnapshot): boolean {
    return snapshot.status === Status.Delivering;
  }

  canCompletePickup(snapshot: OrderDeliverySnapshot): boolean {
    return snapshot.status === Status.ReadyForDelivery && snapshot.deliveryMethod.isPickup();
  }
}
