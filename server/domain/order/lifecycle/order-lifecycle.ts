import { OrderLifecycleViolationError } from "@server/domain/order/exceptions/order.errors";
import { OrderStateBehaviorRegistry } from "@server/domain/order/lifecycle/state-behavior";
import { OrderTransitionRules } from "@server/domain/order/lifecycle/transition-rules";
import type { OrderLifecycleAction } from "@server/domain/order/lifecycle/order-lifecycle.types";
import type { OrderLifecycleStatus } from "@server/domain/order/status/order-status";

export type { OrderLifecycleAction } from "@server/domain/order/lifecycle/order-lifecycle.types";

export class OrderLifecycle {
  static transition(
    current: OrderLifecycleStatus,
    action: OrderLifecycleAction,
  ): OrderLifecycleStatus {
    const behavior = OrderStateBehaviorRegistry.forStatus(current);
    if (!behavior.allowedActions().includes(action)) {
      throw new OrderLifecycleViolationError(
        `Action "${action}" is not allowed from status "${current}"`,
        current,
        current,
      );
    }

    const next = OrderTransitionRules.resolve(current, action);
    if (!next) {
      throw new OrderLifecycleViolationError(
        `Action "${action}" is not allowed from status "${current}"`,
        current,
        current,
      );
    }

    return next;
  }

  static canTransition(current: OrderLifecycleStatus, action: OrderLifecycleAction): boolean {
    return OrderTransitionRules.canResolve(current, action);
  }

  static isStatusChanging(current: OrderLifecycleStatus, action: OrderLifecycleAction): boolean {
    return OrderTransitionRules.isStatusChanging(current, action);
  }
}
