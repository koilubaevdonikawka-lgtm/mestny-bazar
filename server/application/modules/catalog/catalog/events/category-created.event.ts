import type { Category } from "@server/application/modules/catalog/catalog/models";

export interface CategoryCreatedEvent {
  readonly type: "category.created";
  readonly category: Category;
  readonly occurredAt: string;
}

export function createCategoryCreatedEvent(category: Category): CategoryCreatedEvent {
  return Object.freeze({
    type: "category.created",
    category,
    occurredAt: new Date().toISOString(),
  });
}
