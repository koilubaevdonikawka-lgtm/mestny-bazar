import type { Category } from "@server/application/modules/catalog/catalog/models/category.model";

/** Tree node for a category and its descendants. */
export interface CategoryTreeNode {
  readonly category: Category;
  readonly children: readonly CategoryTreeNode[];
}

/** Category tree for a catalog owned by the Catalog capability module. */
export interface CategoryTree {
  readonly catalogId: string;
  readonly roots: readonly CategoryTreeNode[];
}

export function buildCategoryTree(
  catalogId: string,
  categories: readonly Category[],
): CategoryTree {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const childMap = new Map<string, Category[]>();

  for (const category of categories) {
    const key = category.parentId ?? "__root__";
    const bucket = childMap.get(key) ?? [];
    bucket.push(category);
    childMap.set(key, bucket);
  }

  const buildNode = (category: Category): CategoryTreeNode => {
    const children = (childMap.get(category.id) ?? [])
      .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
      .map((child) => buildNode(child));

    return Object.freeze({
      category,
      children: Object.freeze(children),
    });
  };

  const roots = (childMap.get("__root__") ?? categories.filter((category) => !category.parentId))
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
    .map((category) => buildNode(category));

  return Object.freeze({
    catalogId: catalogId.trim(),
    roots: Object.freeze(roots),
  });
}

export function collectCategoryDescendantIds(
  categoryId: string,
  categories: readonly Category[],
): readonly string[] {
  const byParent = new Map<string, string[]>();

  for (const category of categories) {
    if (!category.parentId) {
      continue;
    }
    const bucket = byParent.get(category.parentId) ?? [];
    bucket.push(category.id);
    byParent.set(category.parentId, bucket);
  }

  const descendants: string[] = [];
  const queue = [...(byParent.get(categoryId) ?? [])];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    descendants.push(current);
    queue.push(...(byParent.get(current) ?? []));
  }

  return Object.freeze(descendants);
}
