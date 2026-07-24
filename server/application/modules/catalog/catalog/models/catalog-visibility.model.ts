/** Canonical category visibility statuses in the catalog module. */
export const CatalogVisibility = {
  Draft: "draft",
  Published: "published",
  Hidden: "hidden",
} as const;

export type CatalogVisibilityValue = (typeof CatalogVisibility)[keyof typeof CatalogVisibility];

export const CATALOG_VISIBILITY_VALUES: readonly CatalogVisibilityValue[] =
  Object.values(CatalogVisibility);

export function isCatalogVisibility(value: string): value is CatalogVisibilityValue {
  return CATALOG_VISIBILITY_VALUES.includes(value as CatalogVisibilityValue);
}

export function assertCatalogVisibility(value: string): CatalogVisibilityValue {
  if (!isCatalogVisibility(value)) {
    throw new Error(`Unknown catalog visibility: ${value}`);
  }
  return value;
}

export function isPublishedCatalogVisibility(visibility: CatalogVisibilityValue): boolean {
  return visibility === CatalogVisibility.Published;
}
