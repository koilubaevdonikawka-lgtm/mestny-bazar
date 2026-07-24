import type { Product } from "@server/domain/product";
import type { ProductReadModel } from "@server/domain/product";

/** Product persistence port — implementation lives in adapters. */
export interface IProductRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findSnapshotById(id: string): Promise<ProductReadModel | null>;
  exists(id: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}
