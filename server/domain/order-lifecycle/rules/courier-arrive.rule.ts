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

/** Courier marks arrival: OUT_FOR_DELIVERY → ARRIVED. */
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
