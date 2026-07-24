import type { SearchFilters } from "@server/application/modules/search/search/dto";

export type SearchTarget = "products" | "categories" | "sellers";

/** Search request for the application search module. */
export interface SearchQuery {
  readonly target: SearchTarget;
  readonly filters: SearchFilters;
}

export function createSearchQuery(target: SearchTarget, filters: SearchFilters = {}): SearchQuery {
  return Object.freeze({ target, filters: Object.freeze({ ...filters }) });
}
