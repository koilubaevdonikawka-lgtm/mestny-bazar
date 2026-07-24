import type { Category } from "@server/application/modules/catalog/catalog/models";

export interface CategoryPublishedEvent {
  readonly type: "category.published";
  readonly category: Category;
  readonly occurredAt: string;
}

export function createCategoryPublishedEvent(category: Category): CategoryPublishedEvent {
  return Object.freeze({
    type: "category.published",
    category,
    occurredAt: new Date().toISOString(),
  });
}
