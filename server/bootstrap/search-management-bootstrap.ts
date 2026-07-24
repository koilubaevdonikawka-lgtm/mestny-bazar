import type { CatalogManagementApplicationService } from "@server/application/catalog-management/services/catalog-management-application.service";
import type { ICatalogSearchReader } from "@server/application/search-management/contracts/catalog-search-reader.contract";
import type { IFullTextSearchProvider } from "@server/application/search-management/contracts/full-text-search-provider.contract";
import type { ISearchAnalyticsProvider } from "@server/application/search-management/contracts/search-analytics-provider.contract";
import type { ISearchIndexProvider } from "@server/application/search-management/contracts/search-index-provider.contract";
import type { ISearchRankingProvider } from "@server/application/search-management/contracts/search-ranking-provider.contract";
import type { ISearchRatingProvider } from "@server/application/search-management/contracts/search-rating-provider.contract";
import type { ISearchSuggestionProvider } from "@server/application/search-management/contracts/search-suggestion-provider.contract";
import {
  AdvancedSearchUseCase,
  AutocompleteUseCase,
  SearchAvailableProductsUseCase,
  SearchByCategoryUseCase,
  SearchByPriceRangeUseCase,
  SearchBySellerUseCase,
  SearchManagementApplicationService,
  SearchManagementService,
  SearchProductsUseCase,
  SearchSuggestionsUseCase,
} from "@server/application/search-management";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CatalogSearchReaderAdapter } from "@server/infrastructure/search/catalog-search-reader.adapter";
import { DefaultSearchRankingProvider } from "@server/infrastructure/search/default-search-ranking.provider";
import { DefaultSearchRatingProvider } from "@server/infrastructure/search/default-search-rating.provider";
import { DefaultSearchSuggestionProvider } from "@server/infrastructure/search/default-search-suggestion.provider";
import { InMemoryFullTextSearchProvider } from "@server/infrastructure/search/in-memory-full-text-search.provider";
import { MemorySearchIndexProvider } from "@server/infrastructure/search/memory-search-index.provider";
import { NoopSearchAnalyticsProvider } from "@server/infrastructure/search/noop-search-analytics.provider";

/** Registers search management services and use cases. */
export function registerSearchManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.CatalogSearchReader, (provider) =>
    new CatalogSearchReaderAdapter(
      provider.resolve<CatalogManagementApplicationService>(
        InfrastructureTokens.CatalogManagementApplicationService,
      ),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.SearchIndexProvider, (provider) =>
    new MemorySearchIndexProvider(
      provider.resolve<ICatalogSearchReader>(InfrastructureTokens.CatalogSearchReader),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.FullTextSearchProvider, () =>
    new InMemoryFullTextSearchProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.SearchRankingProvider, () =>
    new DefaultSearchRankingProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.SearchSuggestionProvider, () =>
    new DefaultSearchSuggestionProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.SearchAnalyticsProvider, () =>
    new NoopSearchAnalyticsProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.SearchRatingProvider, () =>
    new DefaultSearchRatingProvider(),
  );

  registry.registerTransient(InfrastructureTokens.SearchManagementService, (provider) =>
    new SearchManagementService(
      provider.resolve<ICatalogSearchReader>(InfrastructureTokens.CatalogSearchReader),
      provider.resolve<ISearchIndexProvider>(InfrastructureTokens.SearchIndexProvider),
      provider.resolve<IFullTextSearchProvider>(InfrastructureTokens.FullTextSearchProvider),
      provider.resolve<ISearchRankingProvider>(InfrastructureTokens.SearchRankingProvider),
      provider.resolve<ISearchSuggestionProvider>(InfrastructureTokens.SearchSuggestionProvider),
      provider.resolve<ISearchAnalyticsProvider>(InfrastructureTokens.SearchAnalyticsProvider),
      provider.resolve<ISearchRatingProvider>(InfrastructureTokens.SearchRatingProvider),
    ),
  );

  registry.registerTransient(InfrastructureTokens.SearchProductsUseCase, (provider) =>
    new SearchProductsUseCase(
      provider.resolve<SearchManagementService>(InfrastructureTokens.SearchManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.SearchByCategoryUseCase, (provider) =>
    new SearchByCategoryUseCase(
      provider.resolve<SearchManagementService>(InfrastructureTokens.SearchManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.SearchBySellerUseCase, (provider) =>
    new SearchBySellerUseCase(
      provider.resolve<SearchManagementService>(InfrastructureTokens.SearchManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.SearchByPriceRangeUseCase, (provider) =>
    new SearchByPriceRangeUseCase(
      provider.resolve<SearchManagementService>(InfrastructureTokens.SearchManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.SearchAvailableProductsUseCase, (provider) =>
    new SearchAvailableProductsUseCase(
      provider.resolve<SearchManagementService>(InfrastructureTokens.SearchManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.AdvancedSearchUseCase, (provider) =>
    new AdvancedSearchUseCase(
      provider.resolve<SearchManagementService>(InfrastructureTokens.SearchManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.SearchSuggestionsUseCase, (provider) =>
    new SearchSuggestionsUseCase(
      provider.resolve<SearchManagementService>(InfrastructureTokens.SearchManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.AutocompleteUseCase, (provider) =>
    new AutocompleteUseCase(
      provider.resolve<SearchManagementService>(InfrastructureTokens.SearchManagementService),
    ),
  );

  registry.registerTransient(InfrastructureTokens.SearchManagementApplicationService, (provider) =>
    new SearchManagementApplicationService(
      provider.resolve<SearchProductsUseCase>(InfrastructureTokens.SearchProductsUseCase),
      provider.resolve<SearchByCategoryUseCase>(InfrastructureTokens.SearchByCategoryUseCase),
      provider.resolve<SearchBySellerUseCase>(InfrastructureTokens.SearchBySellerUseCase),
      provider.resolve<SearchByPriceRangeUseCase>(InfrastructureTokens.SearchByPriceRangeUseCase),
      provider.resolve<SearchAvailableProductsUseCase>(
        InfrastructureTokens.SearchAvailableProductsUseCase,
      ),
      provider.resolve<AdvancedSearchUseCase>(InfrastructureTokens.AdvancedSearchUseCase),
      provider.resolve<SearchSuggestionsUseCase>(InfrastructureTokens.SearchSuggestionsUseCase),
      provider.resolve<AutocompleteUseCase>(InfrastructureTokens.AutocompleteUseCase),
    ),
  );
}
