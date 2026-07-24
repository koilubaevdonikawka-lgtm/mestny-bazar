import type { CatalogProductCard } from "@server/application/catalog-management/models/catalog-product.model";
import type { SearchSuggestion } from "@server/application/search-management/contracts/search-suggestion-provider.contract";

/** Single search hit with relevance score. */
export interface SearchProductHit {
  readonly product: CatalogProductCard;
  readonly score: number;
  readonly rating: number | null;
}

/** Paginated search result. */
export interface SearchResult {
  readonly items: readonly SearchProductHit[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly query?: string;
}

export interface SearchSuggestionsResult {
  readonly query: string;
  readonly suggestions: readonly SearchSuggestion[];
}

export interface SearchAutocompleteResult {
  readonly query: string;
  readonly completions: readonly string[];
}
