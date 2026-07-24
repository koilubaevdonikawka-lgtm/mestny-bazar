import { ProductStatus } from "@server/domain/product/status/product-status";
import type { ProductLifecycleAction } from "@server/domain/product/lifecycle/product-lifecycle.types";
import { PRODUCT_TRANSITION_RULES } from "@server/domain/product/lifecycle/transition-rules";

/** Future State Pattern hook — behavior contract per lifecycle status. */
export interface ProductStateBehavior {
  readonly status: ProductStatus;
  allowedActions(): readonly ProductLifecycleAction[];
}

class StaticProductStateBehavior implements ProductStateBehavior {
  constructor(readonly status: ProductStatus) {}

  allowedActions(): readonly ProductLifecycleAction[] {
    const transitions = PRODUCT_TRANSITION_RULES[this.status];
    return Object.keys(transitions) as ProductLifecycleAction[];
  }
}

/** Registry placeholder for future state-specific behavior objects. */
export class ProductStateBehaviorRegistry {
  private static readonly cache = new Map<ProductStatus, ProductStateBehavior>();

  static forStatus(status: ProductStatus): ProductStateBehavior {
    const cached = this.cache.get(status);
    if (cached) {
      return cached;
    }

    const behavior = new StaticProductStateBehavior(status);
    this.cache.set(status, behavior);
    return behavior;
  }
}
