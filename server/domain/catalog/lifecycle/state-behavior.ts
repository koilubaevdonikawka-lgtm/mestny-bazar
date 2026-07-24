import { CategoryLifecycleStatus } from "@server/domain/catalog/status/category-status";
import type { CategoryLifecycleAction } from "@server/domain/catalog/lifecycle/category-lifecycle.types";
import { CATEGORY_TRANSITION_RULES } from "@server/domain/catalog/lifecycle/transition-rules";

export interface CategoryStateBehavior {
  readonly status: CategoryLifecycleStatus;
  allowedActions(): readonly CategoryLifecycleAction[];
}

class StaticCategoryStateBehavior implements CategoryStateBehavior {
  constructor(readonly status: CategoryLifecycleStatus) {}

  allowedActions(): readonly CategoryLifecycleAction[] {
    const transitions = CATEGORY_TRANSITION_RULES[this.status];
    return Object.keys(transitions) as CategoryLifecycleAction[];
  }
}

export class CategoryStateBehaviorRegistry {
  private static readonly cache = new Map<CategoryLifecycleStatus, CategoryStateBehavior>();

  static forStatus(status: CategoryLifecycleStatus): CategoryStateBehavior {
    const cached = this.cache.get(status);
    if (cached) {
      return cached;
    }

    const behavior = new StaticCategoryStateBehavior(status);
    this.cache.set(status, behavior);
    return behavior;
  }
}
