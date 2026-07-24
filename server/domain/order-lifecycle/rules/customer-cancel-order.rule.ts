import type {
  OrderLifecycleContext,
  OrderLifecycleResult,
} from "@server/ports/order-lifecycle.port";
import type { OrderLifecycleRule } from "@server/domain/order-lifecycle/order-lifecycle.rule";
import { OrderLifecycleOrder } from "@server/domain/order-lifecycle/order-lifecycle-order";
import { OrderStatus } from "@shared/contracts/order";

const CUSTOMER_CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.CREATED,
  OrderStatus.PAID,
  OrderStatus.CONFIRMED,
];

/** Customer cancels their own order, before warehouse assembly has started. */
export class CustomerCancelOrderRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.ROLE_PERMISSION;

  applies(context: OrderLifecycleContext): boolean {
    return context.reason === "customer_cancel" && context.targetStatus === OrderStatus.CANCELLED;
  }

  evaluate(context: OrderLifecycleContext): OrderLifecycleResult {
    if (!context.actor.id) {
      return {
        allowed: false,
        denialCode: "AUTHENTICATION_REQUIRED",
        message: "Sign in to cancel an order",
      };
    }

    if (!CUSTOMER_CANCELLABLE_STATUSES.includes(context.currentStatus)) {
      return {
        allowed: false,
        denialCode: "ORDER_ALREADY_IN_PROGRESS",
        message: "Order can no longer be cancelled — assembly has already started",
      };
    }

    return { allowed: true };
  }
}
