import type { CatalogProductCard } from "@server/application/catalog-management/models/catalog-product.model";

export interface SearchSuggestion {
  readonly text: string;
  readonly type: "product" | "keyword";
}

/** Search suggestions and autocomplete — replace with dedicated suggestion engine later. */
export interface ISearchSuggestionProvider {
  suggest(products: readonly CatalogProductCard[], query: string, limit?: number): readonly SearchSuggestion[];
  autocomplete(products: readonly CatalogProductCard[], query: string, limit?: number): readonly string[];
}
