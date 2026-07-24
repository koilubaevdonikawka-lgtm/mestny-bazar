import type { SearchFilters } from "@server/application/search-management/dto/search-query.dto";
import {
  AdvancedSearchUseCase,
  AutocompleteUseCase,
  SearchAvailableProductsUseCase,
  SearchByCategoryUseCase,
  SearchByPriceRangeUseCase,
  SearchBySellerUseCase,
  SearchProductsUseCase,
  SearchSuggestionsUseCase,
} from "@server/application/search-management/use-cases/search-management.use-cases";

/** Application facade for search management scenario. */
export class SearchManagementApplicationService {
  constructor(
    private readonly searchProductsUseCase: SearchProductsUseCase,
    private readonly searchByCategoryUseCase: SearchByCategoryUseCase,
    private readonly searchBySellerUseCase: SearchBySellerUseCase,
    private readonly searchByPriceRangeUseCase: SearchByPriceRangeUseCase,
    private readonly searchAvailableProductsUseCase: SearchAvailableProductsUseCase,
    private readonly advancedSearchUseCase: AdvancedSearchUseCase,
    private readonly searchSuggestionsUseCase: SearchSuggestionsUseCase,
    private readonly autocompleteUseCase: AutocompleteUseCase,
  ) {}

  search(filters: SearchFilters = {}) {
    return this.searchProductsUseCase.execute(filters);
  }

  searchByCategory(categoryId: string, filters: SearchFilters = {}) {
    return this.searchByCategoryUseCase.execute(categoryId, filters);
  }

  searchBySeller(sellerId: string, filters: SearchFilters = {}) {
    return this.searchBySellerUseCase.execute(sellerId, filters);
  }

  searchByPriceRange(minPrice: number, maxPrice: number, filters: SearchFilters = {}) {
    return this.searchByPriceRangeUseCase.execute(minPrice, maxPrice, filters);
  }

  searchAvailable(filters: SearchFilters = {}) {
    return this.searchAvailableProductsUseCase.execute(filters);
  }

  advancedSearch(filters: SearchFilters) {
    return this.advancedSearchUseCase.execute(filters);
  }

  suggestions(query: string, limit?: number) {
    return this.searchSuggestionsUseCase.execute(query, limit);
  }

  autocomplete(query: string, limit?: number) {
    return this.autocompleteUseCase.execute(query, limit);
  }
}
