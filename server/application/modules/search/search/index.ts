export { SearchModule } from "./api";
export type { ISearchCatalogProvider } from "./contracts";
export { type SearchFilters, normalizeSearchFilters } from "./dto";
export {
  createSearchQuery,
  type SearchQuery,
  type SearchTarget,
  createSearchResult,
  type CategorySearchResult,
  type ProductSearchResult,
  type SearchResult,
  type SellerSearchResult,
} from "./models";
export { SearchService } from "./services";
