export { SearchModule } from "./search";
export type { ISearchCatalogProvider } from "./search/contracts";
export { type SearchFilters, normalizeSearchFilters } from "./search/dto";
export {
  createSearchQuery,
  type SearchQuery,
  type SearchTarget,
  createSearchResult,
  type CategorySearchResult,
  type ProductSearchResult,
  type SearchResult,
  type SellerSearchResult,
} from "./search/models";
export { SearchService } from "./search/services";
