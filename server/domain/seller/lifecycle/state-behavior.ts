import { SellerLifecycleStatus } from "@server/domain/seller/status/seller-status";
import type { SellerLifecycleAction } from "@server/domain/seller/lifecycle/seller-lifecycle.types";
import { SELLER_TRANSITION_RULES } from "@server/domain/seller/lifecycle/transition-rules";

export interface SellerStateBehavior {
  readonly status: SellerLifecycleStatus;
  allowedActions(): readonly SellerLifecycleAction[];
}

class StaticSellerStateBehavior implements SellerStateBehavior {
  constructor(readonly status: SellerLifecycleStatus) {}

  allowedActions(): readonly SellerLifecycleAction[] {
    const transitions = SELLER_TRANSITION_RULES[this.status];
    return Object.keys(transitions) as SellerLifecycleAction[];
  }
}

export class SellerStateBehaviorRegistry {
  private static readonly cache = new Map<SellerLifecycleStatus, SellerStateBehavior>();

  static forStatus(status: SellerLifecycleStatus): SellerStateBehavior {
    const cached = this.cache.get(status);
    if (cached) {
      return cached;
    }

    const behavior = new StaticSellerStateBehavior(status);
    this.cache.set(status, behavior);
    return behavior;
  }
}
