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

/** Courier starts delivery: READY_FOR_DELIVERY → OUT_FOR_DELIVERY. */
export class CourierStartDeliveryRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.ROLE_PERMISSION;

  applies(context: OrderLifecycleContext): boolean {
    return (
      context.reason === "courier_start_delivery" &&
      context.targetStatus === OrderStatus.OUT_FOR_DELIVERY
    );
  }

  evaluate(context: OrderLifecycleContext): OrderLifecycleResult {
    if (!isCourier(context.actor)) {
      return {
        allowed: false,
        denialCode: "COURIER_ROLE_REQUIRED",
        message: "Courier role is required to start delivery",
      };
    }

    if (context.currentStatus !== OrderStatus.READY_FOR_DELIVERY) {
      return {
        allowed: false,
        denialCode: "INVALID_START_DELIVERY_TRANSITION",
        message: "Only orders ready for delivery can be started",
      };
    }

    return { allowed: true };
  }
}
