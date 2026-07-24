import type { SearchFilters } from "@server/application/modules/search/search/dto";
import type {
  CategorySearchResult,
  ProductSearchResult,
  SearchQuery,
  SellerSearchResult,
} from "@server/application/modules/search/search/models";
import type { SearchService } from "@server/application/modules/search/search/services";

/** Public entry point for the Search business capability module. */
export class SearchModule {
  constructor(private readonly service: SearchService) {}

  products(filters: SearchFilters = {}): Promise<ProductSearchResult> {
    return this.service.products(filters);
  }

  categories(filters: SearchFilters = {}): Promise<CategorySearchResult> {
    return this.service.categories(filters);
  }

  sellers(filters: SearchFilters = {}): Promise<SellerSearchResult> {
    return this.service.sellers(filters);
  }

  search(
    query: SearchQuery,
  ): Promise<ProductSearchResult | CategorySearchResult | SellerSearchResult> {
    return this.service.search(query);
  }
}
