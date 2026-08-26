import type {
  OrderLifecycleContext,
  OrderLifecycleResult,
} from "@server/ports/order-lifecycle.port";
import type { OrderLifecycleRule } from "@server/domain/order-lifecycle/order-lifecycle.rule";
import { OrderLifecycleOrder } from "@server/domain/order-lifecycle/order-lifecycle-order";
import { OrderStatus } from "@shared/contracts/order";

/**
 * Задача №172 — narrow cancellation path for a customer who returned from
 * the Finik payment page without completing an ONLINE payment. Deliberately
 * a separate rule from CustomerCancelOrderRule: no cancellation-window check,
 * no FEATURE_CUSTOMER_CANCELLATION gate (Задача №133) — always on, and only
 * ever applicable to an order that has never been paid.
 */
export class CustomerCancelUnpaidOnlineOrderRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.ROLE_PERMISSION;

  applies(context: OrderLifecycleContext): boolean {
    return (
      context.reason === "customer_cancel_unpaid_online" &&
      context.targetStatus === OrderStatus.CANCELLED
    );
  }

  evaluate(context: OrderLifecycleContext): OrderLifecycleResult {
    if (!context.actor.id) {
      return {
        allowed: false,
        denialCode: "AUTHENTICATION_REQUIRED",
        message: "Sign in to cancel an order",
      };
    }

    if (context.paymentMethod !== "ONLINE") {
      return {
        allowed: false,
        denialCode: "NOT_ONLINE_PAYMENT",
        message: "This cancellation path is only for unpaid ONLINE orders",
      };
    }

    if (context.paymentStatus === "paid") {
      return {
        allowed: false,
        denialCode: "ALREADY_PAID",
        message: "Order is already paid — this cancellation path no longer applies",
      };
    }

    if (context.currentStatus !== OrderStatus.CREATED) {
      return {
        allowed: false,
        denialCode: "INVALID_CANCEL_TRANSITION",
        message: "Order can only be cancelled through this path before payment lands",
      };
    }

    return { allowed: true };
  }
}
