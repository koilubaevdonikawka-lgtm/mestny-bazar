import type { IProductStore } from "@server/application/modules/product/product/contracts";
import type { Product } from "@server/application/modules/product/product/models";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory product store for development and tests. */
export class MemoryProductStore implements IProductStore {
  private readonly store = new InMemoryStore<Product>((product) => product.id);

  async saveProduct(product: Product): Promise<void> {
    this.store.set(product);
  }

  async updateProduct(product: Product): Promise<void> {
    if (!(await this.findById(product.id))) {
      throw new Error(`Product not found: ${product.id}`);
    }
    this.store.set(product);
  }

  async findById(productId: string): Promise<Product | null> {
    return this.store.get(productId) ?? null;
  }

  async exists(productId: string): Promise<boolean> {
    return this.store.has(productId);
  }

  async deleteProduct(productId: string): Promise<void> {
    this.store.delete(productId);
  }

  async findBySellerId(sellerId: string): Promise<readonly Product[]> {
    return this.store.find((product) => product.sellerId === sellerId.trim());
  }

  async findAllProducts(): Promise<readonly Product[]> {
    return this.store.values();
  }
}
