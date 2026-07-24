import type { ISearchCatalogProvider } from "@server/application/modules/search/search/contracts";
import type { CategoryReadModel } from "@server/domain/catalog";
import type { ProductReadModel } from "@server/domain/product";
import type { SellerReadModel } from "@server/domain/seller";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory search catalog provider for development and tests. */
export class MemorySearchCatalogProvider implements ISearchCatalogProvider {
  private readonly productsStore = new InMemoryStore<ProductReadModel>((item) => item.id);
  private readonly categoriesStore = new InMemoryStore<CategoryReadModel>((item) => item.id);
  private readonly sellersStore = new InMemoryStore<SellerReadModel>((item) => item.id);

  indexProduct(product: ProductReadModel): void {
    this.productsStore.set(Object.freeze({ ...product }));
  }

  indexCategory(category: CategoryReadModel): void {
    this.categoriesStore.set(Object.freeze({ ...category }));
  }

  indexSeller(seller: SellerReadModel): void {
    this.sellersStore.set(Object.freeze({ ...seller }));
  }

  async products(): Promise<readonly ProductReadModel[]> {
    return Object.freeze([...this.productsStore.values()]);
  }

  async categories(catalogId?: string): Promise<readonly CategoryReadModel[]> {
    const items = this.categoriesStore.values();
    if (!catalogId) {
      return Object.freeze(items);
    }
    return Object.freeze(items.filter((category) => category.catalogId === catalogId));
  }

  async sellers(): Promise<readonly SellerReadModel[]> {
    return Object.freeze([...this.sellersStore.values()]);
  }
}
