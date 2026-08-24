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
 * Courier marks arrival: OUT_FOR_DELIVERY → ARRIVED.
 * Задача №135 — must be THIS courier's own assigned order (Задача №134
 * found this rule only checked the role, never ownership).
 */
export class CourierArriveRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.ROLE_PERMISSION;

  applies(context: OrderLifecycleContext): boolean {
    return context.reason === "courier_arrive" && context.targetStatus === OrderStatus.ARRIVED;
  }

  evaluate(context: OrderLifecycleContext): OrderLifecycleResult {
    if (!isCourier(context.actor)) {
      return {
        allowed: false,
        denialCode: "COURIER_ROLE_REQUIRED",
        message: "Courier role is required to mark arrival",
      };
    }

    if (context.assignedCourierId !== context.actor.id) {
      return {
        allowed: false,
        denialCode: "COURIER_NOT_ASSIGNED",
        message: "This order is assigned to a different courier",
      };
    }

    if (context.currentStatus !== OrderStatus.OUT_FOR_DELIVERY) {
      return {
        allowed: false,
        denialCode: "INVALID_ARRIVE_TRANSITION",
        message: "Only orders out for delivery can be marked as arrived",
      };
    }

    return { allowed: true };
  }
}
