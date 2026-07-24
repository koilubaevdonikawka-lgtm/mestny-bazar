import type {
  OrderLifecycleActor,
  OrderLifecycleContext,
  OrderLifecycleResult,
} from "@server/ports/order-lifecycle.port";
import type { OrderLifecycleRule } from "@server/domain/order-lifecycle/order-lifecycle.rule";
import { OrderLifecycleOrder } from "@server/domain/order-lifecycle/order-lifecycle-order";
import { OrderStatus } from "@shared/contracts/order";

function isAdmin(actor: OrderLifecycleActor): boolean {
  return actor.roles?.includes("admin") ?? false;
}

/** Admin cancels an order: active statuses → CANCELLED. */
export class AdminCancelOrderRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.ROLE_PERMISSION;

  applies(context: OrderLifecycleContext): boolean {
    return context.reason === "admin_cancel" && context.targetStatus === OrderStatus.CANCELLED;
  }

  evaluate(context: OrderLifecycleContext): OrderLifecycleResult {
    if (!isAdmin(context.actor)) {
      return {
        allowed: false,
        denialCode: "ADMIN_ROLE_REQUIRED",
        message: "Admin role is required to cancel orders",
      };
    }

    if (
      context.currentStatus === OrderStatus.CANCELLED ||
      context.currentStatus === OrderStatus.DELIVERED
    ) {
      return {
        allowed: false,
        denialCode: "INVALID_CANCEL_TRANSITION",
        message: "Order cannot be cancelled in its current state",
      };
    }

    return { allowed: true };
  }
}
