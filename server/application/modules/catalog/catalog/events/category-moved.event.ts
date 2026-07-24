import type { Category } from "@server/application/modules/catalog/catalog/models";

export interface CategoryMovedEvent {
  readonly type: "category.moved";
  readonly category: Category;
  readonly previousParentId: string | null;
  readonly occurredAt: string;
}

export function createCategoryMovedEvent(
  category: Category,
  previousParentId: string | null,
): CategoryMovedEvent {
  return Object.freeze({
    type: "category.moved",
    category,
    previousParentId,
    occurredAt: new Date().toISOString(),
  });
}
