import type { CategoryLifecycleStatus } from "@server/domain/catalog/status/category-status";
import { CategoryLifecycleStatus as Status } from "@server/domain/catalog/status/category-status";
import { CategoryVisibility } from "@server/domain/catalog/value-objects/category-visibility.vo";

export interface CategoryPolicySnapshot {
  status: CategoryLifecycleStatus;
  visibility: CategoryVisibility;
}

export interface CategoryVisibilityContext {
  category: CategoryPolicySnapshot;
  parent: CategoryPolicySnapshot | null;
  hasChildren: boolean;
}

/** Controls category visibility, child visibility, and hiding inheritance. */
export class CategoryVisibilityPolicy {
  isCategoryVisible(snapshot: CategoryPolicySnapshot): boolean {
    return snapshot.status === Status.Visible;
  }

  isCategoryHidden(snapshot: CategoryPolicySnapshot): boolean {
    return snapshot.status === Status.Hidden || snapshot.status === Status.Draft;
  }

  areChildrenPubliclyVisible(context: CategoryVisibilityContext): boolean {
    if (!this.isCategoryVisible(context.category)) {
      return false;
    }

    if (context.parent && !this.isCategoryVisible(context.parent)) {
      return false;
    }

    return true;
  }

  shouldInheritParentHiding(parent: CategoryPolicySnapshot | null): boolean {
    if (!parent) {
      return false;
    }

    return !this.isCategoryVisible(parent);
  }

  canInheritHiddenVisibility(parent: CategoryPolicySnapshot | null): boolean {
    return this.shouldInheritParentHiding(parent);
  }

  shouldCascadeHideToChildren(context: CategoryVisibilityContext): boolean {
    return context.hasChildren && this.isCategoryHidden(context.category);
  }

  canShowCategory(context: CategoryVisibilityContext): boolean {
    if (this.shouldInheritParentHiding(context.parent)) {
      return false;
    }

    return (
      context.category.status === Status.Draft || context.category.status === Status.Hidden
    );
  }

  canExposeInNavigation(snapshot: CategoryPolicySnapshot): boolean {
    return this.isCategoryVisible(snapshot);
  }

  canExposeInSearch(snapshot: CategoryPolicySnapshot): boolean {
    return this.isCategoryVisible(snapshot);
  }

  canUpdateVisibilityFlags(snapshot: CategoryPolicySnapshot): boolean {
    return snapshot.status !== Status.Archived;
  }

  resolveVisibilityForShow(
    current: CategoryVisibility,
    parent: CategoryPolicySnapshot | null,
  ): CategoryVisibility {
    if (this.shouldInheritParentHiding(parent)) {
      return CategoryVisibility.hidden();
    }

    return CategoryVisibility.create({
      showInNavigation: true,
      showInSearch: current.showInSearchValue(),
    });
  }

  resolveVisibilityForHide(): CategoryVisibility {
    return CategoryVisibility.hidden();
  }

  resolveVisibilityForRestore(parent: CategoryPolicySnapshot | null): CategoryVisibility {
    if (this.shouldInheritParentHiding(parent)) {
      return CategoryVisibility.hidden();
    }

    return CategoryVisibility.hidden();
  }

  resolveInheritedVisibilityFromParent(
    parent: CategoryPolicySnapshot | null,
  ): CategoryVisibility {
    if (this.shouldInheritParentHiding(parent)) {
      return CategoryVisibility.hidden();
    }

    return CategoryVisibility.hidden();
  }
}
