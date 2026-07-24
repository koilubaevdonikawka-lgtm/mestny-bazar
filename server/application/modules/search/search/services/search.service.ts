import type { ISearchCatalogProvider } from "@server/application/modules/search/search/contracts";
import type { SearchFilters } from "@server/application/modules/search/search/dto";
import { normalizeSearchFilters } from "@server/application/modules/search/search/dto";
import {
  createSearchQuery,
  type SearchQuery,
} from "@server/application/modules/search/search/models";
import {
  createSearchResult,
  type CategorySearchResult,
  type ProductSearchResult,
  type SellerSearchResult,
} from "@server/application/modules/search/search/models";
import type { CategoryReadModel } from "@server/domain/catalog";
import type { ProductReadModel } from "@server/domain/product";
import type { SellerReadModel } from "@server/domain/seller";

/** Search business capability service — filters indexed marketplace catalog data via ISearchCatalogProvider. */
export class SearchService {
  constructor(private readonly catalog: ISearchCatalogProvider) {}

  async products(filters: SearchFilters = {}): Promise<ProductSearchResult> {
    const query = createSearchQuery("products", filters);
    const normalized = normalizeSearchFilters(filters);
    const items = (await this.catalog.products())
      .filter((product) => matchesProduct(product, normalized))
      .slice(0, normalized.limit ?? 20);

    return createSearchResult(query, items);
  }

  async categories(filters: SearchFilters = {}): Promise<CategorySearchResult> {
    const query = createSearchQuery("categories", filters);
    const normalized = normalizeSearchFilters(filters);
    const items = (await this.catalog.categories(normalized.catalogId))
      .filter((category) => matchesCategory(category, normalized))
      .slice(0, normalized.limit ?? 20);

    return createSearchResult(query, items);
  }

  async sellers(filters: SearchFilters = {}): Promise<SellerSearchResult> {
    const query = createSearchQuery("sellers", filters);
    const normalized = normalizeSearchFilters(filters);
    const items = (await this.catalog.sellers())
      .filter((seller) => matchesSeller(seller, normalized))
      .slice(0, normalized.limit ?? 20);

    return createSearchResult(query, items);
  }

  async search(
    query: SearchQuery,
  ): Promise<ProductSearchResult | CategorySearchResult | SellerSearchResult> {
    switch (query.target) {
      case "products":
        return this.products(query.filters);
      case "categories":
        return this.categories(query.filters);
      case "sellers":
        return this.sellers(query.filters);
      default:
        return this.products(query.filters);
    }
  }
}

function matchesProduct(product: ProductReadModel, filters: SearchFilters): boolean {
  if (filters.sellerId && product.sellerId !== filters.sellerId) {
    return false;
  }
  if (filters.categoryId && product.attributes["categoryId"] !== filters.categoryId) {
    return false;
  }
  if (filters.minPrice !== undefined && product.priceAmount < filters.minPrice) {
    return false;
  }
  if (filters.maxPrice !== undefined && product.priceAmount > filters.maxPrice) {
    return false;
  }
  return matchesQuery(filters.query, product.name, product.description ?? "");
}

function matchesCategory(category: CategoryReadModel, filters: SearchFilters): boolean {
  if (filters.categoryId && category.id !== filters.categoryId && category.parentId !== filters.categoryId) {
    return false;
  }
  return matchesQuery(filters.query, category.name, category.slug, category.path);
}

function matchesSeller(seller: SellerReadModel, filters: SearchFilters): boolean {
  if (filters.sellerId && seller.id !== filters.sellerId) {
    return false;
  }
  return matchesQuery(filters.query, seller.name, seller.email, seller.address);
}

function matchesQuery(query: string | undefined, ...fields: string[]): boolean {
  if (!query) {
    return true;
  }

  const normalized = query.toLowerCase();
  return fields.some((field) => field.toLowerCase().includes(normalized));
}
