import { CategoryHierarchyViolationError } from "@server/domain/catalog/exceptions/catalog.errors";

export const DEFAULT_MAX_CATEGORY_DEPTH = 5;

export interface CategoryHierarchyContext {
  categoryId: string;
  catalogId: string;
  currentParentId: string | null;
  newParentId: string | null;
  currentPath: string;
  newPath: string;
  newDepth: number;
  existingPaths: readonly string[];
  ancestorIds: readonly string[];
  maxDepth?: number;
}

/** Validates category tree integrity during hierarchy changes. */
export class CategoryHierarchyPolicy {
  validateMove(context: CategoryHierarchyContext): void {
    this.assertValidParent(context);
    this.assertNoSelfParent(context);
    this.assertNoCycle(context);
    this.assertMaxDepth(context);
    this.assertUniquePath(context);
  }

  validateCreate(context: Omit<CategoryHierarchyContext, "currentParentId" | "currentPath">): void {
    this.assertValidParent({
      ...context,
      currentParentId: null,
      currentPath: "",
    });
    this.assertMaxDepth(context);
    this.assertUniquePath(context);
  }

  private assertValidParent(context: CategoryHierarchyContext): void {
    if (context.newParentId === null) {
      return;
    }

    if (!context.newParentId.trim()) {
      throw new CategoryHierarchyViolationError("Parent id must be a non-empty string", "invalid_parent");
    }

    if (context.newParentId === context.categoryId) {
      throw new CategoryHierarchyViolationError("Category cannot be its own parent", "invalid_parent");
    }
  }

  private assertNoSelfParent(context: CategoryHierarchyContext): void {
    if (context.newParentId === context.categoryId) {
      throw new CategoryHierarchyViolationError("Category cannot be its own parent", "self_parent");
    }
  }

  private assertNoCycle(context: CategoryHierarchyContext): void {
    if (context.newParentId === null) {
      return;
    }

    if (context.ancestorIds.includes(context.categoryId)) {
      throw new CategoryHierarchyViolationError(
        "Moving category would create a circular reference",
        "circular_reference",
      );
    }
  }

  private assertMaxDepth(context: CategoryHierarchyContext): void {
    const maxDepth = context.maxDepth ?? DEFAULT_MAX_CATEGORY_DEPTH;
    if (context.newDepth > maxDepth) {
      throw new CategoryHierarchyViolationError(
        `Category depth ${context.newDepth} exceeds maximum ${maxDepth}`,
        "max_depth_exceeded",
      );
    }
  }

  private assertUniquePath(context: CategoryHierarchyContext): void {
    const normalizedPath = context.newPath.trim().toLowerCase();
    const conflicting = context.existingPaths.some(
      (path) => path.trim().toLowerCase() === normalizedPath && path !== context.currentPath,
    );

    if (conflicting) {
      throw new CategoryHierarchyViolationError(
        `Category path "${context.newPath}" already exists in catalog`,
        "duplicate_path",
      );
    }
  }
}
