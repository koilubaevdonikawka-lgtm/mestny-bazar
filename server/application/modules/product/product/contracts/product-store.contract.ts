import type { Product } from "@server/application/modules/product/product/models";

/** Product persistence contract — implemented by infrastructure adapters. */
export interface IProductStore {
  saveProduct(product: Product): Promise<void>;
  updateProduct(product: Product): Promise<void>;
  findById(productId: string): Promise<Product | null>;
  exists(productId: string): Promise<boolean>;
  deleteProduct(productId: string): Promise<void>;
  findBySellerId(sellerId: string): Promise<readonly Product[]>;
  findAllProducts(): Promise<readonly Product[]>;
}
