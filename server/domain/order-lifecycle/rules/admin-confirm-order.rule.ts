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

    // Задача №169 (order #121, диагностировано в Задаче №167) — confirming
    // an ONLINE order before its payment lands strands that payment forever:
    // once status is CONFIRMED, PaymentConfirmedRule never allows CREATED→
    // PAID again (currentStatus is no longer CREATED), so a webhook that
    // arrives after this point can update payments.status but can never
    // update the order itself. CASH orders are unaffected — they have no
    // payment webhook to race against.
    if (context.paymentMethod === "ONLINE" && context.paymentStatus !== "paid") {
      return {
        allowed: false,
        denialCode: "PAYMENT_NOT_CONFIRMED",
        message: "Дождитесь подтверждения оплаты перед подтверждением заказа",
      };
    }

    return { allowed: true };
  }
}
