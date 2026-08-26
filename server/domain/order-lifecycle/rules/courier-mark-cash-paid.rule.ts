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

/**
 * Задача №171 — courier marks a CASH order's payment as physically received
 * on arrival: no status change (stays ARRIVED), validation only — same
 * same-status pattern as CourierAcceptOrderRule. ONLINE orders have their
 * payment confirmed by the Finik webhook long before this point, so there
 * is nothing for the courier to collect or mark.
 */
export class CourierMarkCashPaidRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.ROLE_PERMISSION;

  applies(context: OrderLifecycleContext): boolean {
    return (
      context.reason === "courier_mark_cash_paid" && context.targetStatus === OrderStatus.ARRIVED
    );
  }

  evaluate(context: OrderLifecycleContext): OrderLifecycleResult {
    if (!isCourier(context.actor)) {
      return {
        allowed: false,
        denialCode: "COURIER_ROLE_REQUIRED",
        message: "Courier role is required to mark cash payment received",
      };
    }

    if (context.assignedCourierId !== context.actor.id) {
      return {
        allowed: false,
        denialCode: "COURIER_NOT_ASSIGNED",
        message: "This order is assigned to a different courier",
      };
    }

    if (context.currentStatus !== OrderStatus.ARRIVED) {
      return {
        allowed: false,
        denialCode: "INVALID_MARK_CASH_PAID_TRANSITION",
        message: "Cash payment can only be marked received after arrival",
      };
    }

    if (context.paymentMethod !== "CASH") {
      return {
        allowed: false,
        denialCode: "NOT_CASH_PAYMENT",
        message: "Only cash-payment orders can be marked paid this way",
      };
    }

    return { allowed: true };
  }
}
