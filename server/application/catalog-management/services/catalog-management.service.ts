/**
 * Catalog Management — read-only buyer-facing catalog layer.
 *
 * Responsibilities: publication display, product discovery, availability checks.
 * Does NOT create, edit, or delete products (see Seller Product Management).
 *
 * Reads Product BCM via ProductModule and ICatalogProductReader only.
 */
import type { ICatalogPopularityProvider } from "@server/application/catalog-management/contracts/catalog-popularity-provider.contract";
import type { ICatalogProductReader } from "@server/application/catalog-management/contracts/catalog-product-reader.contract";
import type { ICatalogRecommendationProvider } from "@server/application/catalog-management/contracts/catalog-recommendation-provider.contract";
import type {
  CatalogListQuery,
  CatalogRecommendationContext,
} from "@server/application/catalog-management/dto/catalog-query.dto";
import { normalizeCatalogListQuery } from "@server/application/catalog-management/dto/catalog-query.dto";
import type {
  CatalogProductAvailability,
  CatalogProductCard,
  CatalogProductDetails,
  CatalogProductListResult,
} from "@server/application/catalog-management/models/catalog-product.model";
import type { MarketplaceModule } from "@server/application/modules/marketplace/marketplace/api/marketplace.module";
import type { ProductModule } from "@server/application/modules/product/product/api/product.module";
import type { Product, ProductPrice } from "@server/application/modules/product/product/models";

export class CatalogManagementService {
  constructor(
    private readonly products: ProductModule,
    private readonly marketplace: MarketplaceModule,
    private readonly catalogReader: ICatalogProductReader,
    private readonly recommendationProvider: ICatalogRecommendationProvider,
    private readonly popularityProvider: ICatalogPopularityProvider,
  ) {}

  async listProducts(query: CatalogListQuery = {}): Promise<CatalogProductListResult> {
    const normalized = normalizeCatalogListQuery(query);
    const total = await this.catalogReader.countPublishedProducts();
    const published = await this.catalogReader.findPublishedProducts(normalized);
    const items = await this.mapToCards(published);
    return {
      items,
      total,
      limit: normalized.limit,
      offset: normalized.offset,
    };
  }

  async getProductDetails(productId: string): Promise<CatalogProductDetails | null> {
    const product = await this.catalogReader.findPublishedById(productId);
    if (!product) {
      return null;
    }

    const [price, stock] = await Promise.all([
      this.products.getCurrentPrice(productId),
      this.products.getAvailableStock(productId),
    ]);

    return toCatalogDetails(product, stock ?? product.stock.quantity, price ?? product.price);
  }

  async getProductsByCategory(
    categoryId: string,
    query: CatalogListQuery = {},
  ): Promise<CatalogProductListResult> {
    const normalized = normalizeCatalogListQuery(query);
    const published = await this.catalogReader.findPublishedByCategory(categoryId, normalized);
    const items = await this.mapToCards(published);
    return {
      items,
      total: items.length,
      limit: normalized.limit,
      offset: normalized.offset,
    };
  }

  async getProductsBySeller(
    sellerId: string,
    query: CatalogListQuery = {},
  ): Promise<CatalogProductListResult> {
    const normalized = normalizeCatalogListQuery(query);
    const published = await this.catalogReader.findPublishedBySeller(sellerId, normalized);
    const items = await this.mapToCards(published);
    return {
      items,
      total: items.length,
      limit: normalized.limit,
      offset: normalized.offset,
    };
  }

  async getPopularProducts(query: CatalogListQuery = {}): Promise<CatalogProductListResult> {
    const normalized = normalizeCatalogListQuery(query);
    const published = await this.catalogReader.findPublishedProducts({ limit: MAX_SCAN, offset: 0 });
    const ranked = this.popularityProvider.rankPopular(published, normalized.limit);
    const items = await this.mapToCards(ranked);
    return {
      items,
      total: items.length,
      limit: normalized.limit,
      offset: normalized.offset,
    };
  }

  async getNewestProducts(query: CatalogListQuery = {}): Promise<CatalogProductListResult> {
    const normalized = normalizeCatalogListQuery(query);
    const published = await this.catalogReader.findPublishedProducts({ limit: MAX_SCAN, offset: 0 });
    const sorted = [...published].sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    );
    const page = sorted.slice(normalized.offset, normalized.offset + normalized.limit);
    const items = await this.mapToCards(page);
    return {
      items,
      total: sorted.length,
      limit: normalized.limit,
      offset: normalized.offset,
    };
  }

  async getRecommendedProducts(
    query: CatalogListQuery = {},
    context: CatalogRecommendationContext = {},
  ): Promise<CatalogProductListResult> {
    const normalized = normalizeCatalogListQuery(query);
    const published = await this.catalogReader.findPublishedProducts({ limit: MAX_SCAN, offset: 0 });
    const recommended = this.recommendationProvider.recommend(
      published,
      context,
      normalized.limit,
    );
    const items = await this.mapToCards(recommended);
    return {
      items,
      total: items.length,
      limit: normalized.limit,
      offset: normalized.offset,
    };
  }

  async getRelatedProducts(
    productId: string,
    query: CatalogListQuery = {},
  ): Promise<CatalogProductListResult> {
    const normalized = normalizeCatalogListQuery(query);
    const source = await this.catalogReader.findPublishedById(productId);
    if (!source) {
      return { items: [], total: 0, limit: normalized.limit, offset: normalized.offset };
    }

    const published = await this.catalogReader.findPublishedProducts({ limit: MAX_SCAN, offset: 0 });
    const related = this.recommendationProvider.related(source, published, normalized.limit);
    const items = await this.mapToCards(related);
    return {
      items,
      total: items.length,
      limit: normalized.limit,
      offset: normalized.offset,
    };
  }

  async checkAvailability(productId: string): Promise<CatalogProductAvailability | null> {
    const product = await this.products.getProduct(productId);
    if (!product) {
      return null;
    }

    const [published, stock] = await Promise.all([
      this.marketplace.isPublished(productId),
      this.products.getAvailableStock(productId),
    ]);
    const stockQuantity = stock ?? 0;

    return {
      productId,
      published,
      available: published && stockQuantity > 0,
      stockQuantity,
    };
  }

  private async mapToCards(products: readonly Product[]): Promise<readonly CatalogProductCard[]> {
    return Promise.all(
      products.map(async (product) => {
        const [price, stock] = await Promise.all([
          this.products.getCurrentPrice(product.id),
          this.products.getAvailableStock(product.id),
        ]);
        return toCatalogCard(product, stock ?? product.stock.quantity, price ?? product.price);
      }),
    );
  }
}

const MAX_SCAN = 500;

function toCatalogCard(
  product: Product,
  stockAvailable: number,
  price: ProductPrice,
): CatalogProductCard {
  return Object.freeze({
    id: product.id,
    sellerId: product.sellerId,
    name: product.name,
    description: product.description,
    price,
    stockAvailable,
    media: product.media,
    categoryId: product.attributes.categoryId ?? null,
    createdAt: product.createdAt,
  });
}

function toCatalogDetails(
  product: Product,
  stockAvailable: number,
  price: ProductPrice,
): CatalogProductDetails {
  return Object.freeze({
    ...toCatalogCard(product, stockAvailable, price),
    attributes: product.attributes,
  });
}
