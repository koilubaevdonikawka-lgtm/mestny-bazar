import {
  CategoryHierarchyPolicy,
  DEFAULT_MAX_CATEGORY_DEPTH,
  type CategoryHierarchyContext,
} from "@server/domain/catalog/policies/category-hierarchy.policy";
import { CategoryPublishingPolicy } from "@server/domain/catalog/policies/category-publishing.policy";
import {
  CategoryVisibilityPolicy,
  type CategoryPolicySnapshot,
  type CategoryVisibilityContext,
} from "@server/domain/catalog/policies/category-visibility.policy";

/** Coordinates specialized catalog policies. */
export class CatalogPolicy {
  private readonly visibility = new CategoryVisibilityPolicy();
  private readonly hierarchy = new CategoryHierarchyPolicy();
  private readonly publishing = new CategoryPublishingPolicy();

  canPublish(snapshot: CategoryPolicySnapshot): boolean {
    return this.publishing.canPublish(snapshot);
  }

  canHide(snapshot: CategoryPolicySnapshot): boolean {
    return this.publishing.canHide(snapshot);
  }

  canArchive(snapshot: CategoryPolicySnapshot): boolean {
    return this.publishing.canArchive(snapshot);
  }

  canRestore(snapshot: CategoryPolicySnapshot): boolean {
    return this.publishing.canRestore(snapshot);
  }

  canRename(snapshot: CategoryPolicySnapshot): boolean {
    return this.publishing.canRename(snapshot);
  }

  canMove(snapshot: CategoryPolicySnapshot): boolean {
    return this.publishing.canMove(snapshot);
  }

  canChangeSortOrder(snapshot: CategoryPolicySnapshot): boolean {
    return this.publishing.canChangeSortOrder(snapshot);
  }

  isCategoryVisible(snapshot: CategoryPolicySnapshot): boolean {
    return this.visibility.isCategoryVisible(snapshot);
  }

  areChildrenPubliclyVisible(context: CategoryVisibilityContext): boolean {
    return this.visibility.areChildrenPubliclyVisible(context);
  }

  shouldInheritParentHiding(parent: CategoryPolicySnapshot | null): boolean {
    return this.visibility.shouldInheritParentHiding(parent);
  }

  shouldCascadeHideToChildren(context: CategoryVisibilityContext): boolean {
    return this.visibility.shouldCascadeHideToChildren(context);
  }

  canShowCategory(context: CategoryVisibilityContext): boolean {
    return this.visibility.canShowCategory(context);
  }

  canUpdateVisibilityFlags(snapshot: CategoryPolicySnapshot): boolean {
    return this.visibility.canUpdateVisibilityFlags(snapshot);
  }

  canExposeInNavigation(snapshot: CategoryPolicySnapshot): boolean {
    return this.visibility.canExposeInNavigation(snapshot);
  }

  canExposeInSearch(snapshot: CategoryPolicySnapshot): boolean {
    return this.visibility.canExposeInSearch(snapshot);
  }

  resolveVisibilityForShow(
    current: CategoryPolicySnapshot["visibility"],
    parent: CategoryPolicySnapshot | null,
  ): CategoryPolicySnapshot["visibility"] {
    return this.visibility.resolveVisibilityForShow(current, parent);
  }

  resolveVisibilityForHide(): CategoryPolicySnapshot["visibility"] {
    return this.visibility.resolveVisibilityForHide();
  }

  resolveVisibilityForRestore(
    parent: CategoryPolicySnapshot | null,
  ): CategoryPolicySnapshot["visibility"] {
    return this.visibility.resolveVisibilityForRestore(parent);
  }

  resolveInheritedVisibilityFromParent(
    parent: CategoryPolicySnapshot | null,
  ): CategoryPolicySnapshot["visibility"] {
    return this.visibility.resolveInheritedVisibilityFromParent(parent);
  }

  validateHierarchyMove(context: CategoryHierarchyContext): void {
    this.hierarchy.validateMove(context);
  }

  validateHierarchyCreate(
    context: Omit<CategoryHierarchyContext, "currentParentId" | "currentPath">,
  ): void {
    this.hierarchy.validateCreate(context);
  }
}

export {
  CategoryVisibilityPolicy,
  CategoryHierarchyPolicy,
  CategoryPublishingPolicy,
  DEFAULT_MAX_CATEGORY_DEPTH,
};

export type { CategoryPolicySnapshot, CategoryHierarchyContext, CategoryVisibilityContext };
