/**
 * Search Management — read-only product search over Catalog Management.
 *
 * Does NOT store, modify, or locate products physically.
 * All catalog data is accessed exclusively via ICatalogSearchReader.
 */
import type { CatalogProductCard } from "@server/application/catalog-management/models/catalog-product.model";
import type { ICatalogSearchReader } from "@server/application/search-management/contracts/catalog-search-reader.contract";
import type { IFullTextSearchProvider } from "@server/application/search-management/contracts/full-text-search-provider.contract";
import type { ISearchAnalyticsProvider } from "@server/application/search-management/contracts/search-analytics-provider.contract";
import type { ISearchIndexProvider } from "@server/application/search-management/contracts/search-index-provider.contract";
import type { ISearchRankingProvider } from "@server/application/search-management/contracts/search-ranking-provider.contract";
import type { ISearchRatingProvider } from "@server/application/search-management/contracts/search-rating-provider.contract";
import type { ISearchSuggestionProvider } from "@server/application/search-management/contracts/search-suggestion-provider.contract";
import type { SearchFilters } from "@server/application/search-management/dto/search-query.dto";
import {
  MAX_SEARCH_SCAN,
  normalizeSearchFilters,
} from "@server/application/search-management/dto/search-query.dto";
import type {
  SearchAutocompleteResult,
  SearchProductHit,
  SearchResult,
  SearchSuggestionsResult,
} from "@server/application/search-management/models/search-result.model";

export class SearchManagementService {
  constructor(
    private readonly catalogReader: ICatalogSearchReader,
    private readonly indexProvider: ISearchIndexProvider,
    private readonly fullTextSearch: IFullTextSearchProvider,
    private readonly rankingProvider: ISearchRankingProvider,
    private readonly suggestionProvider: ISearchSuggestionProvider,
    private readonly analyticsProvider: ISearchAnalyticsProvider,
    private readonly ratingProvider: ISearchRatingProvider,
  ) {}

  async searchProducts(filters: SearchFilters = {}): Promise<SearchResult> {
    return this.executeSearch(filters);
  }

  async searchByCategory(categoryId: string, filters: SearchFilters = {}): Promise<SearchResult> {
    return this.executeSearch({ ...filters, categoryId });
  }

  async searchBySeller(sellerId: string, filters: SearchFilters = {}): Promise<SearchResult> {
    return this.executeSearch({ ...filters, sellerId });
  }

  async searchByPriceRange(
    minPrice: number,
    maxPrice: number,
    filters: SearchFilters = {},
  ): Promise<SearchResult> {
    return this.executeSearch({ ...filters, minPrice, maxPrice });
  }

  async searchAvailableProducts(filters: SearchFilters = {}): Promise<SearchResult> {
    return this.executeSearch({ ...filters, availableOnly: true });
  }

  async advancedSearch(filters: SearchFilters): Promise<SearchResult> {
    return this.executeSearch(filters);
  }

  async searchSuggestions(query: string, limit?: number): Promise<SearchSuggestionsResult> {
    const normalizedQuery = query.trim();
    await this.analyticsProvider.trackSuggestion(normalizedQuery);
    const products = await this.loadCandidateProducts({});
    const suggestions = this.suggestionProvider.suggest(products, normalizedQuery, limit);
    return { query: normalizedQuery, suggestions };
  }

  async autocomplete(query: string, limit?: number): Promise<SearchAutocompleteResult> {
    const normalizedQuery = query.trim();
    await this.analyticsProvider.trackAutocomplete(normalizedQuery);
    const products = await this.loadCandidateProducts({});
    const completions = this.suggestionProvider.autocomplete(products, normalizedQuery, limit);
    return { query: normalizedQuery, completions };
  }

  private async executeSearch(filters: SearchFilters): Promise<SearchResult> {
    const normalized = normalizeSearchFilters(filters);
    const candidates = await this.loadCandidateProducts(normalized);
    const filtered = await this.applyFilters(candidates, normalized);
    const scores = this.buildScores(filtered, normalized.query);
    const ranked = this.rankingProvider.rank(filtered, scores);
    const page = ranked.slice(normalized.offset, normalized.offset + normalized.limit);
    const hits = await this.toHits(page, scores);

    await this.analyticsProvider.trackSearch(normalized, ranked.length);

    return {
      items: hits,
      total: ranked.length,
      limit: normalized.limit,
      offset: normalized.offset,
      query: normalized.query,
    };
  }

  private async loadCandidateProducts(filters: SearchFilters): Promise<readonly CatalogProductCard[]> {
    const scanQuery = { limit: MAX_SEARCH_SCAN, offset: 0 };

    if (filters.categoryId) {
      return (await this.catalogReader.listByCategory(filters.categoryId, scanQuery)).items;
    }
    if (filters.sellerId) {
      return (await this.catalogReader.listBySeller(filters.sellerId, scanQuery)).items;
    }

    await this.indexProvider.refresh();
    return this.indexProvider.getIndexedProducts();
  }

  private async applyFilters(
    products: readonly CatalogProductCard[],
    filters: SearchFilters,
  ): Promise<readonly CatalogProductCard[]> {
    let result = [...products];

    if (filters.query?.trim()) {
      result = [...this.fullTextSearch.filter(result, filters.query.trim())];
    }
    if (filters.categoryId) {
      result = result.filter((product) => product.categoryId === filters.categoryId);
    }
    if (filters.sellerId) {
      result = result.filter((product) => product.sellerId === filters.sellerId);
    }
    if (filters.minPrice !== undefined) {
      result = result.filter((product) => product.price.amount >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter((product) => product.price.amount <= filters.maxPrice!);
    }
    if (filters.availableOnly) {
      result = result.filter((product) => product.stockAvailable > 0);
    }
    if (filters.minRating !== undefined) {
      result = await this.filterByRating(result, filters.minRating);
    }

    return result;
  }

  private async filterByRating(
    products: readonly CatalogProductCard[],
    minRating: number,
  ): Promise<readonly CatalogProductCard[]> {
    const kept: CatalogProductCard[] = [];
    for (const product of products) {
      const rating = await this.ratingProvider.getRating(product.id);
      if (rating !== null && rating >= minRating) {
        kept.push(product);
      }
    }
    return kept;
  }

  private buildScores(
    products: readonly CatalogProductCard[],
    query?: string,
  ): ReadonlyMap<string, number> {
    const scores = new Map<string, number>();
    const normalizedQuery = query?.trim();

    for (const product of products) {
      scores.set(
        product.id,
        normalizedQuery ? this.fullTextSearch.score(product, normalizedQuery) : 1,
      );
    }

    return scores;
  }

  private async toHits(
    products: readonly CatalogProductCard[],
    scores: ReadonlyMap<string, number>,
  ): Promise<readonly SearchProductHit[]> {
    return Promise.all(
      products.map(async (product) =>
        Object.freeze({
          product,
          score: scores.get(product.id) ?? 0,
          rating: await this.ratingProvider.getRating(product.id),
        }),
      ),
    );
  }
}
