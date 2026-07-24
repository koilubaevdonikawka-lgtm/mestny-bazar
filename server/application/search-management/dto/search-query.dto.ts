export interface SearchFilters {
  readonly query?: string;
  readonly categoryId?: string;
  readonly sellerId?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly availableOnly?: boolean;
  readonly minRating?: number;
  readonly limit?: number;
  readonly offset?: number;
}

export const DEFAULT_SEARCH_LIMIT = 20;
export const MAX_SEARCH_LIMIT = 100;
export const MAX_SEARCH_SCAN = 1000;

export function normalizeSearchFilters(filters: SearchFilters = {}): Required<
  Pick<SearchFilters, "limit" | "offset">
> &
  SearchFilters {
  const limit = Math.min(Math.max(filters.limit ?? DEFAULT_SEARCH_LIMIT, 1), MAX_SEARCH_LIMIT);
  const offset = Math.max(filters.offset ?? 0, 0);
  return { ...filters, limit, offset };
}
