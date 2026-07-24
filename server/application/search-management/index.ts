export type { ICatalogSearchReader } from "./contracts/catalog-search-reader.contract";
export type { ISearchIndexProvider } from "./contracts/search-index-provider.contract";
export type { IFullTextSearchProvider } from "./contracts/full-text-search-provider.contract";
export type { ISearchRankingProvider } from "./contracts/search-ranking-provider.contract";
export type {
  ISearchSuggestionProvider,
  SearchSuggestion,
} from "./contracts/search-suggestion-provider.contract";
export type { ISearchAnalyticsProvider } from "./contracts/search-analytics-provider.contract";
export type { ISearchRatingProvider } from "./contracts/search-rating-provider.contract";
export type {
  IElasticsearchAdapter,
  IMeilisearchAdapter,
  IAISearchProvider,
  IVectorSearchProvider,
  ISearchRecommendationEngine,
  ISearchExperienceEngine,
} from "./contracts/search-extension-ports.contract";
export type { SearchFilters } from "./dto/search-query.dto";
export {
  DEFAULT_SEARCH_LIMIT,
  MAX_SEARCH_LIMIT,
  normalizeSearchFilters,
} from "./dto/search-query.dto";
export type {
  SearchProductHit,
  SearchResult,
  SearchSuggestionsResult,
  SearchAutocompleteResult,
} from "./models/search-result.model";
export { SearchManagementService } from "./services/search-management.service";
export { SearchManagementApplicationService } from "./services/search-management-application.service";
export {
  SearchProductsUseCase,
  SearchByCategoryUseCase,
  SearchBySellerUseCase,
  SearchByPriceRangeUseCase,
  SearchAvailableProductsUseCase,
  AdvancedSearchUseCase,
  SearchSuggestionsUseCase,
  AutocompleteUseCase,
} from "./use-cases/search-management.use-cases";
