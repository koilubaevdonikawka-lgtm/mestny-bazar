import { OrderLifecycleStatus } from "@server/domain/order/status/order-status";
import type { OrderLifecycleAction } from "@server/domain/order/lifecycle/order-lifecycle.types";

export type OrderTransitionMatrix = Record<
  OrderLifecycleStatus,
  Partial<Record<OrderLifecycleAction, OrderLifecycleStatus>>
>;

/** Pure transition rules — independent from future state objects. */
export const ORDER_TRANSITION_RULES: OrderTransitionMatrix = {
  [OrderLifecycleStatus.Draft]: {
    confirm: OrderLifecycleStatus.PendingPayment,
    cancel: OrderLifecycleStatus.Cancelled,
  },
  [OrderLifecycleStatus.PendingPayment]: {
    pay: OrderLifecycleStatus.Paid,
    cancel: OrderLifecycleStatus.Cancelled,
  },
  [OrderLifecycleStatus.Paid]: {
    start_preparing: OrderLifecycleStatus.Preparing,
    cancel: OrderLifecycleStatus.Cancelled,
  },
  [OrderLifecycleStatus.Preparing]: {
    complete_preparing: OrderLifecycleStatus.ReadyForDelivery,
    cancel: OrderLifecycleStatus.Cancelled,
  },
  [OrderLifecycleStatus.ReadyForDelivery]: {
    hand_to_courier: OrderLifecycleStatus.ReadyForDelivery,
    start_delivery: OrderLifecycleStatus.Delivering,
    deliver: OrderLifecycleStatus.Completed,
    cancel: OrderLifecycleStatus.Cancelled,
  },
  [OrderLifecycleStatus.Delivering]: {
    deliver: OrderLifecycleStatus.Completed,
    cancel: OrderLifecycleStatus.Cancelled,
  },
  [OrderLifecycleStatus.Completed]: {
    refund: OrderLifecycleStatus.Refunded,
    close: OrderLifecycleStatus.Closed,
  },
  [OrderLifecycleStatus.Cancelled]: {
    close: OrderLifecycleStatus.Closed,
  },
  [OrderLifecycleStatus.Refunded]: {
    close: OrderLifecycleStatus.Closed,
  },
  [OrderLifecycleStatus.Closed]: {},
};

export class OrderTransitionRules {
  static resolve(
    current: OrderLifecycleStatus,
    action: OrderLifecycleAction,
  ): OrderLifecycleStatus | undefined {
    return ORDER_TRANSITION_RULES[current][action];
  }

  static canResolve(current: OrderLifecycleStatus, action: OrderLifecycleAction): boolean {
    return OrderTransitionRules.resolve(current, action) !== undefined;
  }

  static isStatusChanging(current: OrderLifecycleStatus, action: OrderLifecycleAction): boolean {
    const next = OrderTransitionRules.resolve(current, action);
    return next !== undefined && next !== current;
  }
}
