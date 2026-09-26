import type {
  OrderLifecycleContext,
  OrderLifecycleResult,
} from "@server/ports/order-lifecycle.port";
import type { OrderLifecycleRule } from "@server/domain/order-lifecycle/order-lifecycle.rule";
import { OrderLifecycleOrder } from "@server/domain/order-lifecycle/order-lifecycle-order";
import { OrderStatus } from "@shared/contracts/order";
import { isWithinCancellationWindow } from "@shared/lib/order-cancellation";

/**
 * "NEW" / "PENDING_PAYMENT" in product terms: CREATED before payment settles,
 * PAID once payment succeeds but before an admin has accepted the order.
 * CONFIRMED ("accepted") and anything after is no longer the customer's to
 * cancel — TerminalStateGuardRule (GLOBAL_GUARD, runs first) separately
 * blocks CANCELLED/DELIVERED regardless of this list.
 */
const CUSTOMER_CANCELLABLE_STATUSES: OrderStatus[] = [OrderStatus.CREATED, OrderStatus.PAID];

/**
 * Customer cancels their own order, within a short window after creation and
 * before an admin has accepted it. A signed-in customer cancels an order of
 * their own account; a guest cancels a guest order (orders.user_id NULL) by
 * knowing its UUID.
 *
 * Задача №133 — gated by `FEATURE_CUSTOMER_CANCELLATION` (Composition Root
 * only, server/di/container.ts — this class itself never reads env, per
 * docs/principles/11-feature-flags.md's "domain service не читает env
 * напрямую"). Temporarily muted by the architect; all the logic below stays
 * intact and ready to re-enable by flipping the flag back to "true" — no
 * code deletion.
 */
export class CustomerCancelOrderRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.ROLE_PERMISSION;

  constructor(private readonly enabled: boolean = false) {}

  applies(context: OrderLifecycleContext): boolean {
    return context.reason === "customer_cancel" && context.targetStatus === OrderStatus.CANCELLED;
  }

  evaluate(context: OrderLifecycleContext): OrderLifecycleResult {
    if (!this.enabled) {
      return {
        allowed: false,
        denialCode: "CANCELLATION_DISABLED",
        message: "Self-service order cancellation is currently unavailable",
      };
    }

    // Guest (no session): the order's UUID is the access key — the same
    // trade-off getOrderStatusFn/order-success already make for guest
    // orders. Only ever for a guest order, though: an order that belongs to
    // an account can be cancelled only by that account, signed in (the
    // caller already scoped its read to actor.id), never by UUID alone.
    // `!== null` (not a falsy check) so a caller that forgot to pass
    // orderUserId is refused rather than let through.
    if (!context.actor.id && context.orderUserId !== null) {
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
        message: "Order can no longer be cancelled — it has already been accepted",
      };
    }

    // Never trust a client-supplied elapsed time: order.createdAt (read from
    // the DB by the caller) and the server's own clock are the only inputs.
    if (!context.orderCreatedAt) {
      return {
        allowed: false,
        denialCode: "CANCELLATION_WINDOW_UNKNOWN",
        message: "Cannot verify the cancellation window for this order",
      };
    }

    if (!isWithinCancellationWindow(context.orderCreatedAt)) {
      return {
        allowed: false,
        denialCode: "CANCELLATION_WINDOW_EXPIRED",
        message: "The 2-minute cancellation window has passed",
      };
    }

    return { allowed: true };
  }
}
