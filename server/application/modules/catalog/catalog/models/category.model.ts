import {
  CatalogVisibility,
  type CatalogVisibilityValue,
} from "@server/application/modules/catalog/catalog/models/catalog-visibility.model";

/** Category node owned by the Catalog capability module. */
export interface Category {
  readonly id: string;
  readonly catalogId: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly parentId: string | null;
  readonly childrenIds: readonly string[];
  readonly sortOrder: number;
  readonly visibility: CatalogVisibilityValue;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createCategory(input: {
  id: string;
  catalogId: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  sortOrder?: number;
}): Category {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    catalogId: input.catalogId.trim(),
    name: input.name.trim(),
    slug: input.slug.trim(),
    description: input.description?.trim() || null,
    parentId: input.parentId?.trim() || null,
    childrenIds: Object.freeze([]),
    sortOrder: input.sortOrder ?? 0,
    visibility: CatalogVisibility.Draft,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function updateCategoryDetails(
  category: Category,
  input: {
    name: string;
    slug: string;
    description?: string | null;
    sortOrder?: number;
  },
): Category {
  return Object.freeze({
    ...category,
    name: input.name.trim(),
    slug: input.slug.trim(),
    description: input.description?.trim() || null,
    sortOrder: input.sortOrder ?? category.sortOrder,
    updatedAt: new Date().toISOString(),
  });
}

export function withCategoryParent(
  category: Category,
  parentId: string | null,
  sortOrder?: number,
): Category {
  return Object.freeze({
    ...category,
    parentId: parentId?.trim() || null,
    sortOrder: sortOrder ?? category.sortOrder,
    updatedAt: new Date().toISOString(),
  });
}

export function withCategoryChildren(
  category: Category,
  childrenIds: readonly string[],
): Category {
  return Object.freeze({
    ...category,
    childrenIds: Object.freeze([...childrenIds]),
    updatedAt: new Date().toISOString(),
  });
}

export function withCategoryVisibility(
  category: Category,
  visibility: CatalogVisibilityValue,
): Category {
  return Object.freeze({
    ...category,
    visibility,
    updatedAt: new Date().toISOString(),
  });
}

export function slugifyCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
