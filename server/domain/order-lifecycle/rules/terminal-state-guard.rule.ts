import type {
  OrderLifecycleContext,
  OrderLifecycleResult,
} from "@server/ports/order-lifecycle.port";
import type { OrderLifecycleRule } from "@server/domain/order-lifecycle/order-lifecycle.rule";
import { OrderLifecycleOrder } from "@server/domain/order-lifecycle/order-lifecycle-order";
import { OrderStatus } from "@shared/contracts/order";

/** Blocks transitions from terminal order states (cancelled, delivered). */
export class TerminalStateGuardRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.GLOBAL_GUARD;
  readonly terminal = false;

  applies(context: OrderLifecycleContext): boolean {
    return context.reason !== "checkout_create";
  }

  evaluate(context: OrderLifecycleContext): OrderLifecycleResult {
    if (
      context.currentStatus === OrderStatus.CANCELLED ||
      context.currentStatus === OrderStatus.DELIVERED
    ) {
      return {
        allowed: false,
        denialCode: "TERMINAL_STATE",
        message: "Order is in a terminal state and cannot be changed",
      };
    }
    return { allowed: true };
  }
}
