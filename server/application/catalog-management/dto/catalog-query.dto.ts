/** Shared pagination and context for catalog read queries. */
export interface CatalogListQuery {
  readonly limit?: number;
  readonly offset?: number;
}

export interface CatalogRecommendationContext {
  readonly customerId?: string;
  readonly sessionId?: string;
}

export const DEFAULT_CATALOG_LIMIT = 20;
export const MAX_CATALOG_LIMIT = 100;

export function normalizeCatalogListQuery(query: CatalogListQuery = {}): Required<CatalogListQuery> {
  const limit = Math.min(Math.max(query.limit ?? DEFAULT_CATALOG_LIMIT, 1), MAX_CATALOG_LIMIT);
  const offset = Math.max(query.offset ?? 0, 0);
  return { limit, offset };
}
