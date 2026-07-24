import type { Category } from "@server/application/modules/catalog/catalog/models";

export interface CategoryUpdatedEvent {
  readonly type: "category.updated";
  readonly category: Category;
  readonly occurredAt: string;
}

export function createCategoryUpdatedEvent(category: Category): CategoryUpdatedEvent {
  return Object.freeze({
    type: "category.updated",
    category,
    occurredAt: new Date().toISOString(),
  });
}
