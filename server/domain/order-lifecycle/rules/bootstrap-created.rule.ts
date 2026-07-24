import type {
  OrderLifecycleContext,
  OrderLifecycleResult,
} from "@server/ports/order-lifecycle.port";
import type { OrderLifecycleRule } from "@server/domain/order-lifecycle/order-lifecycle.rule";
import { OrderLifecycleOrder } from "@server/domain/order-lifecycle/order-lifecycle-order";
import { OrderStatus } from "@shared/contracts/order";

/** Sets CREATED as the initial order status on checkout. */
export class BootstrapCreatedRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.FINAL;

  applies(context: OrderLifecycleContext): boolean {
    return (
      context.reason === "checkout_create" &&
      context.targetStatus === OrderStatus.CREATED
    );
  }

  evaluate(_context: OrderLifecycleContext): OrderLifecycleResult {
    return { allowed: true };
  }
}
