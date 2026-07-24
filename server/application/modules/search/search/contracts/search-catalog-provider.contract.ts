import type { CategoryReadModel } from "@server/domain/catalog";
import type { ProductReadModel } from "@server/domain/product";
import type { SellerReadModel } from "@server/domain/seller";

/** Search catalog persistence contract — implemented by infrastructure adapters. */
export interface ISearchCatalogProvider {
  products(): Promise<readonly ProductReadModel[]>;
  categories(catalogId?: string): Promise<readonly CategoryReadModel[]>;
  sellers(): Promise<readonly SellerReadModel[]>;
}
