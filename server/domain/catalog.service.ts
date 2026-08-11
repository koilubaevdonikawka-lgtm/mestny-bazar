import type { ProductDTO, ProductListParams, ProductListResult } from "@shared/contracts/catalog";
import type { IProductRepository } from "@server/ports/product.repository";
import type { ICategoryRepository } from "@server/ports/category.repository";

export class CatalogService {
  constructor(
    private readonly products: IProductRepository,
    private readonly categories: ICategoryRepository,
  ) {}

  async listProducts(params: ProductListParams): Promise<ProductListResult> {
    if (!params.categorySlug) {
      return this.products.list(params);
    }

    // Resolves the client-facing slug to the internal id the products table
    // is actually keyed on (mirrors SellerProductService.assertCategoryExists
    // — cross-repository composition belongs at the service layer, not
    // inside a single-table repository). An unknown/inactive slug is not an
    // error — it's an empty result, same as any other filter matching zero
    // rows, so callers don't need special-case handling for it.
    const category = await this.categories.getBySlug(params.categorySlug);
    if (!category) {
      return {
        items: [],
        total: 0,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 50,
        hasMore: false,
      };
    }

    return this.products.list({ ...params, categoryId: category.id });
  }

  async getProductBySlug(slug: string): Promise<ProductDTO | null> {
    return this.products.getBySlug(slug);
  }
}
