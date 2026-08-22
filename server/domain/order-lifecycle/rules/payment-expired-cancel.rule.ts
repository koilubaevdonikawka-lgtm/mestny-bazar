import type {
  OrderLifecycleContext,
  OrderLifecycleResult,
} from "@server/ports/order-lifecycle.port";
import type { OrderLifecycleRule } from "@server/domain/order-lifecycle/order-lifecycle.rule";
import { OrderLifecycleOrder } from "@server/domain/order-lifecycle/order-lifecycle-order";
import { OrderStatus } from "@shared/contracts/order";

/** System transition (payment-expiry sweep, Промпт №087) CREATED → CANCELLED. Mirrors PaymentConfirmedRule's shape — no actor/role check, this is a background system action, not a customer/admin request. */
export class PaymentExpiredCancelRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.PAYMENT_GATE;

  applies(context: OrderLifecycleContext): boolean {
    return context.reason === "payment_expired" && context.targetStatus === OrderStatus.CANCELLED;
  }

  evaluate(context: OrderLifecycleContext): OrderLifecycleResult {
    if (context.currentStatus !== OrderStatus.CREATED) {
      return {
        allowed: false,
        denialCode: "INVALID_EXPIRY_TRANSITION",
        message: "Only newly created, unpaid orders can be auto-cancelled for payment expiry",
      };
    }
    return { allowed: true };
  }
}
