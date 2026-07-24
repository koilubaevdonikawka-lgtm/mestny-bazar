/** Catalog aggregate root owned by the Catalog capability module. */
export interface Catalog {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly rootCategoryIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createCatalog(input: {
  id: string;
  name: string;
  description?: string | null;
}): Catalog {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    description: input.description?.trim() || null,
    rootCategoryIds: Object.freeze([]),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function withCatalogRootCategories(
  catalog: Catalog,
  rootCategoryIds: readonly string[],
): Catalog {
  return Object.freeze({
    ...catalog,
    rootCategoryIds: Object.freeze([...rootCategoryIds]),
    updatedAt: new Date().toISOString(),
  });
}

export function withCatalogDetails(
  catalog: Catalog,
  input: { name: string; description?: string | null },
): Catalog {
  return Object.freeze({
    ...catalog,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    updatedAt: new Date().toISOString(),
  });
}
