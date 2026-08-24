import type {
  OrderLifecycleActor,
  OrderLifecycleContext,
  OrderLifecycleResult,
} from "@server/ports/order-lifecycle.port";
import type { OrderLifecycleRule } from "@server/domain/order-lifecycle/order-lifecycle.rule";
import { OrderLifecycleOrder } from "@server/domain/order-lifecycle/order-lifecycle-order";
import { OrderStatus } from "@shared/contracts/order";

function isCourier(actor: OrderLifecycleActor): boolean {
  return actor.roles?.includes("courier") ?? false;
}

/**
 * Courier completes delivery: ARRIVED → DELIVERED.
 * Задача №135 — must be THIS courier's own assigned order (Задача №134
 * found this rule only checked the role, never ownership).
 */
export class CourierCompleteDeliveryRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.ROLE_PERMISSION;

  applies(context: OrderLifecycleContext): boolean {
    return (
      context.reason === "courier_complete_delivery" &&
      context.targetStatus === OrderStatus.DELIVERED
    );
  }

  evaluate(context: OrderLifecycleContext): OrderLifecycleResult {
    if (!isCourier(context.actor)) {
      return {
        allowed: false,
        denialCode: "COURIER_ROLE_REQUIRED",
        message: "Courier role is required to complete delivery",
      };
    }

    if (context.assignedCourierId !== context.actor.id) {
      return {
        allowed: false,
        denialCode: "COURIER_NOT_ASSIGNED",
        message: "This order is assigned to a different courier",
      };
    }

    if (
      context.currentStatus !== OrderStatus.ARRIVED &&
      context.currentStatus !== OrderStatus.OUT_FOR_DELIVERY
    ) {
      return {
        allowed: false,
        denialCode: "INVALID_COMPLETE_DELIVERY_TRANSITION",
        message: "Only arrived orders can be marked as delivered",
      };
    }

    return { allowed: true };
  }
}
