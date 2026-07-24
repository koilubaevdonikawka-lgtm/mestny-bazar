import type { SearchFilters } from "@server/application/search-management/dto/search-query.dto";
import type {
  SearchAutocompleteResult,
  SearchResult,
  SearchSuggestionsResult,
} from "@server/application/search-management/models/search-result.model";
import type { SearchManagementService } from "@server/application/search-management/services/search-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class SearchProductsUseCase {
  constructor(private readonly search: SearchManagementService) {}

  execute(filters: SearchFilters = {}): Promise<UseCaseResult<SearchResult>> {
    return this.search.searchProducts(filters).then(useCaseResult);
  }
}

export class SearchByCategoryUseCase {
  constructor(private readonly search: SearchManagementService) {}

  execute(
    categoryId: string,
    filters: SearchFilters = {},
  ): Promise<UseCaseResult<SearchResult>> {
    return this.search.searchByCategory(categoryId, filters).then(useCaseResult);
  }
}

export class SearchBySellerUseCase {
  constructor(private readonly search: SearchManagementService) {}

  execute(sellerId: string, filters: SearchFilters = {}): Promise<UseCaseResult<SearchResult>> {
    return this.search.searchBySeller(sellerId, filters).then(useCaseResult);
  }
}

export class SearchByPriceRangeUseCase {
  constructor(private readonly search: SearchManagementService) {}

  execute(
    minPrice: number,
    maxPrice: number,
    filters: SearchFilters = {},
  ): Promise<UseCaseResult<SearchResult>> {
    return this.search.searchByPriceRange(minPrice, maxPrice, filters).then(useCaseResult);
  }
}

export class SearchAvailableProductsUseCase {
  constructor(private readonly search: SearchManagementService) {}

  execute(filters: SearchFilters = {}): Promise<UseCaseResult<SearchResult>> {
    return this.search.searchAvailableProducts(filters).then(useCaseResult);
  }
}

export class AdvancedSearchUseCase {
  constructor(private readonly search: SearchManagementService) {}

  execute(filters: SearchFilters): Promise<UseCaseResult<SearchResult>> {
    return this.search.advancedSearch(filters).then(useCaseResult);
  }
}

export class SearchSuggestionsUseCase {
  constructor(private readonly search: SearchManagementService) {}

  execute(query: string, limit?: number): Promise<UseCaseResult<SearchSuggestionsResult>> {
    return this.search.searchSuggestions(query, limit).then(useCaseResult);
  }
}

export class AutocompleteUseCase {
  constructor(private readonly search: SearchManagementService) {}

  execute(query: string, limit?: number): Promise<UseCaseResult<SearchAutocompleteResult>> {
    return this.search.autocomplete(query, limit).then(useCaseResult);
  }
}
