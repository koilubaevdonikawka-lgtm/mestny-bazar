import type { IProductStore } from "@server/application/modules/product/product/contracts";
import type { CatalogModule } from "@server/application/modules/catalog/catalog/api/catalog.module";
import type { InventoryModule } from "@server/application/modules/inventory/inventory/api/inventory.module";
import type { PricingModule } from "@server/application/modules/pricing/pricing/api/pricing.module";
import type { SellerModule } from "@server/application/modules/seller/seller/api/seller.module";
import type {
  CreateProductDto,
  PublishProductDto,
  UpdateProductDto,
} from "@server/application/modules/product/product/dto";
import {
  createProductCreatedEvent,
  createProductUpdatedEvent,
} from "@server/application/modules/product/product/events";
import {
  createProduct,
  createProductPrice,
  ProductStatus,
  type Product,
  type ProductPrice,
  updateProductDetails,
  withProductStatus,
} from "@server/application/modules/product/product/models";
import { ProductPolicy } from "@server/application/modules/product/product/services/product-policy";
import type { IIdGenerator } from "@server/application/ports";

/** Product business capability service — orchestrates product lifecycle via IProductStore. */
export class ProductService {
  private readonly policy = new ProductPolicy();

  constructor(
    private readonly store: IProductStore,
    private readonly idGenerator: IIdGenerator,
    private readonly sellers: SellerModule,
    private readonly catalog: CatalogModule,
    private readonly inventory: InventoryModule,
    private readonly pricing: PricingModule,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    validateCreateProductDto(dto);
    await this.requireRegisteredSeller(dto.sellerId);
    await this.requirePublishedCategoryFromAttributes(dto.attributes);

    const productId = this.idGenerator.generate();
    const product = createProduct({
      id: productId,
      sellerId: dto.sellerId,
      name: dto.name,
      description: dto.description,
      priceAmount: dto.priceAmount,
      priceCurrency: dto.priceCurrency,
      stockQuantity: dto.stockQuantity,
      media: dto.media?.map((item, index) =>
        Object.freeze({
          id: item.id?.trim() || this.idGenerator.generate(),
          url: item.url,
          sortOrder: item.sortOrder ?? index,
        }),
      ),
      attributes: dto.attributes,
    });

    await this.store.saveProduct(product);
    createProductCreatedEvent({
      productId: product.id,
      sellerId: product.sellerId,
      name: product.name,
      status: product.status,
    });

    return product;
  }

  async updateProduct(dto: UpdateProductDto): Promise<Product> {
    const product = await this.requireOwnedProduct(dto.productId, dto.sellerId);
    if (!this.policy.canEdit(product)) {
      throw new Error(`Product ${product.id} cannot be edited in status ${product.status}.`);
    }

    const updated = updateProductDetails(product, {
      name: dto.name,
      description: dto.description,
      media: dto.media?.map((item, index) =>
        Object.freeze({
          id: item.id?.trim() || this.idGenerator.generate(),
          url: item.url,
          sortOrder: item.sortOrder ?? index,
        }),
      ),
      attributes: dto.attributes,
    });

    await this.requirePublishedCategoryFromAttributes(updated.attributes);

    await this.store.updateProduct(updated);
    createProductUpdatedEvent({
      productId: updated.id,
      sellerId: updated.sellerId,
      name: updated.name,
    });

    return updated;
  }

  async prepareForPublication(dto: PublishProductDto): Promise<Product> {
    let product = await this.requireOwnedProduct(dto.productId, dto.sellerId);
    const initialStatus = product.status;

    while (product.status !== ProductStatus.ReadyForPublication) {
      const nextStatus = this.policy.advanceStatusForPublication(product.status);
      if (nextStatus === product.status) {
        break;
      }
      product = withProductStatus(product, nextStatus);
    }

    if (!this.policy.canPublish(product)) {
      throw new Error(`Product ${product.id} is not ready for publication.`);
    }

    if (product.status !== initialStatus) {
      await this.store.updateProduct(product);
    }

    return product;
  }

  async getProduct(productId: string): Promise<Product | null> {
    return this.store.findById(productId.trim());
  }

  async exists(productId: string): Promise<boolean> {
    return this.store.exists(productId.trim());
  }

  async getCurrentPrice(productId: string): Promise<ProductPrice | null> {
    const price = await this.pricing.getCurrentPrice(productId.trim());
    if (!price) {
      return null;
    }
    return createProductPrice(price.amount, price.currency);
  }

  async getAvailableStock(productId: string): Promise<number | null> {
    return this.inventory.getAvailableQuantity(productId.trim());
  }

  private async requireOwnedProduct(productId: string, sellerId: string): Promise<Product> {
    const seller = await this.requireRegisteredSeller(sellerId);
    const product = await this.store.findById(productId.trim());
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }
    if (product.sellerId !== seller.id) {
      throw new Error(`Product ${productId} does not belong to seller ${sellerId}.`);
    }
    return product;
  }

  private async requireRegisteredSeller(sellerId: string) {
    const seller = await this.sellers.getSeller(sellerId);
    if (!seller) {
      throw new Error(`Seller not found: ${sellerId}`);
    }
    return seller;
  }

  private async requirePublishedCategoryFromAttributes(
    attributes?: Readonly<Record<string, string>>,
  ): Promise<void> {
    const categoryId = attributes?.categoryId?.trim();
    if (!categoryId) {
      return;
    }

    await this.requirePublishedCategory(categoryId);
  }

  private async requirePublishedCategory(categoryId: string): Promise<void> {
    const category = await this.catalog.getCategory(categoryId);
    if (!category) {
      throw new Error(`Category not found: ${categoryId}`);
    }

    const published = await this.catalog.isCategoryPublished(categoryId);
    if (!published) {
      throw new Error(`Category ${categoryId} is not published.`);
    }
  }
}

function validateCreateProductDto(dto: CreateProductDto): void {
  if (!dto.sellerId?.trim()) {
    throw new Error("Seller id is required.");
  }
  if (!dto.name?.trim()) {
    throw new Error("Product name is required.");
  }
  if (!Number.isFinite(dto.priceAmount) || dto.priceAmount <= 0) {
    throw new Error("Product price amount must be a positive number.");
  }
  if (!dto.priceCurrency?.trim()) {
    throw new Error("Product price currency is required.");
  }
  if (!Number.isInteger(dto.stockQuantity) || dto.stockQuantity < 0) {
    throw new Error("Product stock quantity must be a non-negative integer.");
  }
}
