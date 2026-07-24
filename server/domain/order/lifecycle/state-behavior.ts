import { OrderLifecycleStatus } from "@server/domain/order/status/order-status";
import type { OrderLifecycleAction } from "@server/domain/order/lifecycle/order-lifecycle.types";
import { ORDER_TRANSITION_RULES } from "@server/domain/order/lifecycle/transition-rules";

export interface OrderStateBehavior {
  readonly status: OrderLifecycleStatus;
  allowedActions(): readonly OrderLifecycleAction[];
}

class StaticOrderStateBehavior implements OrderStateBehavior {
  constructor(readonly status: OrderLifecycleStatus) {}

  allowedActions(): readonly OrderLifecycleAction[] {
    const transitions = ORDER_TRANSITION_RULES[this.status];
    return Object.keys(transitions) as OrderLifecycleAction[];
  }
}

export class OrderStateBehaviorRegistry {
  private static readonly cache = new Map<OrderLifecycleStatus, OrderStateBehavior>();

  static forStatus(status: OrderLifecycleStatus): OrderStateBehavior {
    const cached = this.cache.get(status);
    if (cached) {
      return cached;
    }

    const behavior = new StaticOrderStateBehavior(status);
    this.cache.set(status, behavior);
    return behavior;
  }
}
