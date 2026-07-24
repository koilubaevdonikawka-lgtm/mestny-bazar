import type { CategoryReadModel } from "@server/domain/catalog";
import type { ProductReadModel } from "@server/domain/product";
import type { SellerReadModel } from "@server/domain/seller";
import type { SearchQuery } from "@server/application/modules/search/search/models/search-query.model";

export interface SearchResult<T> {
  readonly query: SearchQuery;
  readonly total: number;
  readonly items: readonly T[];
}

export function createSearchResult<T>(query: SearchQuery, items: readonly T[]): SearchResult<T> {
  return Object.freeze({
    query,
    total: items.length,
    items: Object.freeze([...items]),
  });
}

export type ProductSearchResult = SearchResult<ProductReadModel>;
export type CategorySearchResult = SearchResult<CategoryReadModel>;
export type SellerSearchResult = SearchResult<SellerReadModel>;
