import type {
  OrderLifecycleContext,
  OrderLifecycleResult,
} from "@server/ports/order-lifecycle.port";
import type { OrderLifecycleRule } from "@server/domain/order-lifecycle/order-lifecycle.rule";
import { OrderLifecycleOrder } from "@server/domain/order-lifecycle/order-lifecycle-order";
import { OrderStatus } from "@shared/contracts/order";

/** System transition (webhook-confirmed payment) CREATED → PAID. Промпт №075. */
export class PaymentConfirmedRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.PAYMENT_GATE;

  applies(context: OrderLifecycleContext): boolean {
    return context.reason === "payment_confirmed" && context.targetStatus === OrderStatus.PAID;
  }

  evaluate(context: OrderLifecycleContext): OrderLifecycleResult {
    if (context.currentStatus !== OrderStatus.CREATED) {
      return {
        allowed: false,
        denialCode: "INVALID_PAYMENT_TRANSITION",
        message: "Only newly created orders can be marked paid",
      };
    }
    return { allowed: true };
  }
}
