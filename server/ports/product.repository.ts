import type { ProductDTO, ProductListParams, ProductListResult } from "@shared/contracts/catalog";

export interface IProductRepository {
  list(params: ProductListParams): Promise<ProductListResult>;
  getBySlug(slug: string): Promise<ProductDTO | null>;
  getById(id: string): Promise<ProductDTO | null>;
  checkStock(productId: string, quantity: number): Promise<boolean>;
}
