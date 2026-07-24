import { CategoryLifecycleStatus } from "@server/domain/catalog/status/category-status";
import type { CategoryLifecycleAction } from "@server/domain/catalog/lifecycle/category-lifecycle.types";

export type CategoryTransitionMatrix = Record<
  CategoryLifecycleStatus,
  Partial<Record<CategoryLifecycleAction, CategoryLifecycleStatus>>
>;

/** Pure transition rules — independent from future state objects. */
export const CATEGORY_TRANSITION_RULES: CategoryTransitionMatrix = {
  [CategoryLifecycleStatus.Draft]: {
    show: CategoryLifecycleStatus.Visible,
    hide: CategoryLifecycleStatus.Hidden,
    archive: CategoryLifecycleStatus.Archived,
  },
  [CategoryLifecycleStatus.Hidden]: {
    show: CategoryLifecycleStatus.Visible,
    archive: CategoryLifecycleStatus.Archived,
  },
  [CategoryLifecycleStatus.Visible]: {
    hide: CategoryLifecycleStatus.Hidden,
    archive: CategoryLifecycleStatus.Archived,
  },
  [CategoryLifecycleStatus.Archived]: {
    restore: CategoryLifecycleStatus.Hidden,
  },
};

export class CategoryTransitionRules {
  static resolve(
    current: CategoryLifecycleStatus,
    action: CategoryLifecycleAction,
  ): CategoryLifecycleStatus | undefined {
    return CATEGORY_TRANSITION_RULES[current][action];
  }

  static canResolve(current: CategoryLifecycleStatus, action: CategoryLifecycleAction): boolean {
    return CategoryTransitionRules.resolve(current, action) !== undefined;
  }
}
