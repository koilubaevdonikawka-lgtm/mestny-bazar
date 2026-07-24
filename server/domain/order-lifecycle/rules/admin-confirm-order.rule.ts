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

const CONFIRMABLE_STATUSES = new Set<OrderStatus>([OrderStatus.CREATED, OrderStatus.PAID]);

/** Admin confirms a new order: CREATED/PAID → CONFIRMED. */
export class AdminConfirmOrderRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.ROLE_PERMISSION;

  applies(context: OrderLifecycleContext): boolean {
    return context.reason === "admin_confirm" && context.targetStatus === OrderStatus.CONFIRMED;
  }

  evaluate(context: OrderLifecycleContext): OrderLifecycleResult {
    if (!isAdmin(context.actor)) {
      return {
        allowed: false,
        denialCode: "ADMIN_ROLE_REQUIRED",
        message: "Admin role is required to confirm orders",
      };
    }

    if (!CONFIRMABLE_STATUSES.has(context.currentStatus)) {
      return {
        allowed: false,
        denialCode: "INVALID_CONFIRM_TRANSITION",
        message: "Only new orders can be confirmed",
      };
    }

    return { allowed: true };
  }
}
