import type { ICatalogProductReader } from "@server/application/catalog-management/contracts/catalog-product-reader.contract";
import type { CatalogListQuery } from "@server/application/catalog-management/dto/catalog-query.dto";
import { normalizeCatalogListQuery } from "@server/application/catalog-management/dto/catalog-query.dto";
import type { MarketplaceModule } from "@server/application/modules/marketplace/marketplace/api/marketplace.module";
import type { IProductStore } from "@server/application/modules/product/product/contracts";
import {
  isPubliclyVisibleProductStatus,
  type Product,
} from "@server/application/modules/product/product/models";

/** Infrastructure adapter — reads published products without modifying Product BCM. */
export class CatalogProductReader implements ICatalogProductReader {
  private publishedCache: readonly Product[] | null = null;

  constructor(
    private readonly productStore: IProductStore,
    private readonly marketplace: MarketplaceModule,
  ) {}

  async findPublishedProducts(query: CatalogListQuery = {}): Promise<readonly Product[]> {
    const normalized = normalizeCatalogListQuery(query);
    const published = await this.loadPublishedProducts();
    return published.slice(normalized.offset, normalized.offset + normalized.limit);
  }

  async findPublishedByCategory(
    categoryId: string,
    query: CatalogListQuery = {},
  ): Promise<readonly Product[]> {
    const normalized = normalizeCatalogListQuery(query);
    const published = await this.loadPublishedProducts();
    const filtered = published.filter(
      (product) => product.attributes.categoryId === categoryId.trim(),
    );
    return filtered.slice(normalized.offset, normalized.offset + normalized.limit);
  }

  async findPublishedBySeller(
    sellerId: string,
    query: CatalogListQuery = {},
  ): Promise<readonly Product[]> {
    const normalized = normalizeCatalogListQuery(query);
    const published = await this.loadPublishedProducts();
    const filtered = published.filter((product) => product.sellerId === sellerId.trim());
    return filtered.slice(normalized.offset, normalized.offset + normalized.limit);
  }

  async findPublishedById(productId: string): Promise<Product | null> {
    const product = await this.productStore.findById(productId.trim());
    if (!product || !isPubliclyVisibleProductStatus(product.status)) {
      return null;
    }
    if (!(await this.marketplace.isPublished(product.id))) {
      return null;
    }
    return product;
  }

  async countPublishedProducts(): Promise<number> {
    const published = await this.loadPublishedProducts();
    return published.length;
  }

  /** Clears in-process cache — useful for tests. */
  clearCache(): void {
    this.publishedCache = null;
  }

  private async loadPublishedProducts(): Promise<readonly Product[]> {
    if (this.publishedCache) {
      return this.publishedCache;
    }

    const allProducts = await this.productStore.findAllProducts();
    const published: Product[] = [];

    for (const product of allProducts) {
      if (!isPubliclyVisibleProductStatus(product.status)) {
        continue;
      }
      if (await this.marketplace.isPublished(product.id)) {
        published.push(product);
      }
    }

    this.publishedCache = Object.freeze([...published]);
    return this.publishedCache;
  }
}
