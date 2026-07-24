/** Shared marketplace search filters. */
export interface SearchFilters {
  readonly query?: string;
  readonly sellerId?: string;
  readonly catalogId?: string;
  readonly categoryId?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly limit?: number;
}

export function normalizeSearchFilters(filters: SearchFilters = {}): SearchFilters {
  return Object.freeze({
    query: filters.query?.trim() || undefined,
    sellerId: filters.sellerId?.trim() || undefined,
    catalogId: filters.catalogId?.trim() || undefined,
    categoryId: filters.categoryId?.trim() || undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    limit: filters.limit ?? 20,
  });
}
