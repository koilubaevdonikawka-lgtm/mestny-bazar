import type { ProductDTO, ProductListParams, ProductListResult } from "@shared/contracts/catalog";
import type { IProductRepository } from "@server/ports/product.repository";

export class CatalogService {
  constructor(private readonly products: IProductRepository) {}

  async listProducts(params: ProductListParams): Promise<ProductListResult> {
    return this.products.list(params);
  }

  async getProductBySlug(slug: string): Promise<ProductDTO | null> {
    return this.products.getBySlug(slug);
  }
}
