import { CategoryLifecycleViolationError } from "@server/domain/catalog/exceptions/catalog.errors";
import { CategoryStateBehaviorRegistry } from "@server/domain/catalog/lifecycle/state-behavior";
import { CategoryTransitionRules } from "@server/domain/catalog/lifecycle/transition-rules";
import type { CategoryLifecycleAction } from "@server/domain/catalog/lifecycle/category-lifecycle.types";
import type { CategoryLifecycleStatus } from "@server/domain/catalog/status/category-status";

export type { CategoryLifecycleAction } from "@server/domain/catalog/lifecycle/category-lifecycle.types";

export class CategoryLifecycle {
  static transition(
    current: CategoryLifecycleStatus,
    action: CategoryLifecycleAction,
  ): CategoryLifecycleStatus {
    const behavior = CategoryStateBehaviorRegistry.forStatus(current);
    if (!behavior.allowedActions().includes(action)) {
      throw new CategoryLifecycleViolationError(
        `Action "${action}" is not allowed from status "${current}"`,
        current,
        current,
      );
    }

    const next = CategoryTransitionRules.resolve(current, action);
    if (!next) {
      throw new CategoryLifecycleViolationError(
        `Action "${action}" is not allowed from status "${current}"`,
        current,
        current,
      );
    }

    return next;
  }

  static canTransition(current: CategoryLifecycleStatus, action: CategoryLifecycleAction): boolean {
    return CategoryTransitionRules.canResolve(current, action);
  }
}
