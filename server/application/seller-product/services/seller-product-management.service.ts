import type { IProductStore } from "@server/application/modules/product/product/contracts";
import type { InventoryModule } from "@server/application/modules/inventory/inventory/api/inventory.module";
import type { MarketplaceModule } from "@server/application/modules/marketplace/marketplace/api/marketplace.module";
import type { ModerationModule } from "@server/application/modules/moderation/moderation/api/moderation.module";
import { ModerationTarget } from "@server/application/modules/moderation/moderation/models";
import type { NotificationModule } from "@server/application/modules/notification/notification/api/notification.module";
import {
  createNotificationRecipient,
  NotificationChannel,
  NotificationRecipientType,
} from "@server/application/modules/notification/notification/models";
import type { PricingModule } from "@server/application/modules/pricing/pricing/api/pricing.module";
import type { ProductModule } from "@server/application/modules/product/product/api/product.module";
import type {
  CreateProductDto,
  CreateProductMediaDto,
  UpdateProductDto,
} from "@server/application/modules/product/product/dto";
import {
  createProductPrice,
  createProductStock,
  ProductStatus,
  type Product,
  withProductPrice,
  withProductStatus,
  withProductStock,
} from "@server/application/modules/product/product/models";
import { ProductPolicy } from "@server/application/modules/product/product/services/product-policy";
import type { SellerModule } from "@server/application/modules/seller/seller/api/seller.module";

export interface CreateSellerProductInput {
  readonly sellerId: string;
  readonly name: string;
  readonly description?: string | null;
  readonly priceAmount: number;
  readonly priceCurrency: string;
  readonly stockQuantity: number;
  readonly media?: readonly CreateProductMediaDto[];
  readonly attributes?: Readonly<Record<string, string>>;
}

export interface UpdateSellerProductInput {
  readonly productId: string;
  readonly sellerId: string;
  readonly name?: string;
  readonly description?: string | null;
  readonly media?: readonly CreateProductMediaDto[];
  readonly attributes?: Readonly<Record<string, string>>;
}

export interface ChangeProductPriceInput {
  readonly productId: string;
  readonly sellerId: string;
  readonly amount: number;
  readonly currency: string;
}

export interface ChangeProductInventoryInput {
  readonly productId: string;
  readonly sellerId: string;
  readonly quantity: number;
}

export interface UploadProductImagesInput {
  readonly productId: string;
  readonly sellerId: string;
  readonly media: readonly CreateProductMediaDto[];
}

export interface SellerProductActionInput {
  readonly productId: string;
  readonly sellerId: string;
}

export interface ModeratorRejectProductInput {
  readonly productId: string;
  readonly reason: string;
}

/** Orchestrates seller product lifecycle across Product, Pricing, Inventory, Moderation, and Marketplace BCM. */
export class SellerProductManagementService {
  private readonly policy = new ProductPolicy();

  constructor(
    private readonly products: ProductModule,
    private readonly productStore: IProductStore,
    private readonly sellers: SellerModule,
    private readonly pricing: PricingModule,
    private readonly inventory: InventoryModule,
    private readonly moderation: ModerationModule,
    private readonly marketplace: MarketplaceModule,
    private readonly notifications: NotificationModule,
  ) {}

  async createProduct(input: CreateSellerProductInput): Promise<Product> {
    const dto: CreateProductDto = {
      sellerId: input.sellerId,
      name: input.name,
      description: input.description,
      priceAmount: input.priceAmount,
      priceCurrency: input.priceCurrency,
      stockQuantity: input.stockQuantity,
      media: input.media,
      attributes: input.attributes,
    };

    const product = await this.products.createProduct(dto);

    await this.pricing.createPrice({
      productId: product.id,
      amount: input.priceAmount,
      currency: input.priceCurrency,
    });

    await this.inventory.createInventoryItem({
      productId: product.id,
      quantity: input.stockQuantity,
    });

    return product;
  }

  updateProduct(input: UpdateSellerProductInput): Promise<Product> {
    const dto: UpdateProductDto = {
      productId: input.productId,
      sellerId: input.sellerId,
      name: input.name,
      description: input.description,
      media: input.media,
      attributes: input.attributes,
    };
    return this.products.updateProduct(dto);
  }

  async uploadImages(input: UploadProductImagesInput): Promise<Product> {
    const product = await this.requireOwnedProduct(input.productId, input.sellerId);
    if (!this.policy.canEdit(product)) {
      throw new Error(`Product ${product.id} cannot be edited in status ${product.status}.`);
    }

    return this.products.updateProduct({
      productId: input.productId,
      sellerId: input.sellerId,
      media: input.media,
    });
  }

  async changePrice(input: ChangeProductPriceInput): Promise<Product> {
    const product = await this.requireOwnedProduct(input.productId, input.sellerId);
    if (!this.policy.canChangePrice(product)) {
      throw new Error(`Product ${product.id} price cannot be changed in status ${product.status}.`);
    }

    const currentPrice = await this.pricing.getCurrentPrice(product.id);
    if (currentPrice) {
      await this.pricing.updatePrice({
        productId: product.id,
        amount: input.amount,
        currency: input.currency,
      });
    } else {
      await this.pricing.createPrice({
        productId: product.id,
        amount: input.amount,
        currency: input.currency,
      });
    }

    const updated = withProductPrice(product, createProductPrice(input.amount, input.currency));
    await this.productStore.updateProduct(updated);
    return updated;
  }

  async changeInventory(input: ChangeProductInventoryInput): Promise<Product> {
    const product = await this.requireOwnedProduct(input.productId, input.sellerId);
    if (!this.policy.canChangeStock(product)) {
      throw new Error(`Product ${product.id} stock cannot be changed in status ${product.status}.`);
    }

    const item = await this.inventory.getInventory(product.id);
    if (!item) {
      await this.inventory.createInventoryItem({
        productId: product.id,
        quantity: input.quantity,
      });
    } else {
      const delta = input.quantity - item.quantity;
      if (delta !== 0) {
        await this.inventory.adjustQuantity({
          productId: product.id,
          quantityDelta: delta,
        });
      }
    }

    const updated = withProductStock(product, createProductStock(input.quantity));
    await this.productStore.updateProduct(updated);
    return updated;
  }

  async submitForModeration(input: SellerProductActionInput): Promise<Product> {
    const product = await this.requireOwnedProduct(input.productId, input.sellerId);
    if (product.status !== ProductStatus.Draft && product.status !== ProductStatus.Hidden) {
      throw new Error(`Product ${product.id} cannot be submitted from status ${product.status}.`);
    }

    const updated = withProductStatus(product, ProductStatus.PendingReview);
    await this.productStore.updateProduct(updated);

    await this.moderation.requestModeration({
      target: ModerationTarget.Product,
      targetId: product.id,
      requestedBy: input.sellerId,
    });

    await this.notifySeller(input.sellerId, `Product "${product.name}" submitted for moderation.`);
    return updated;
  }

  async approveProduct(productId: string): Promise<Product> {
    const product = await this.requireProduct(productId);
    if (product.status !== ProductStatus.PendingReview) {
      throw new Error(`Product ${product.id} cannot be approved from status ${product.status}.`);
    }

    await this.moderation.approve({
      target: ModerationTarget.Product,
      targetId: product.id,
    });

    const updated = withProductStatus(product, ProductStatus.ReadyForPublication);
    await this.productStore.updateProduct(updated);
    await this.notifySeller(product.sellerId, `Product "${product.name}" approved for publication.`);
    return updated;
  }

  async rejectProduct(productId: string, reason: string): Promise<Product> {
    const product = await this.requireProduct(productId);
    if (product.status !== ProductStatus.PendingReview) {
      throw new Error(`Product ${product.id} cannot be rejected from status ${product.status}.`);
    }

    await this.moderation.reject({
      target: ModerationTarget.Product,
      targetId: product.id,
      reason,
    });

    const updated = withProductStatus(product, ProductStatus.Draft);
    await this.productStore.updateProduct(updated);
    await this.notifySeller(
      product.sellerId,
      `Product "${product.name}" rejected: ${reason}`,
    );
    return updated;
  }

  async publishProduct(input: SellerProductActionInput): Promise<Product> {
    const product = await this.requireOwnedProduct(input.productId, input.sellerId);
    if (product.status !== ProductStatus.ReadyForPublication) {
      throw new Error(`Product ${product.id} is not ready for publication.`);
    }

    if (!this.policy.canPublish(product)) {
      throw new Error(
        `Product ${product.id} requires at least one image and available stock before publication.`,
      );
    }

    await this.products.publishProduct({
      productId: product.id,
      sellerId: input.sellerId,
    });

    await this.marketplace.approveListing({ productId: product.id });

    const updated = withProductStatus(product, ProductStatus.Published);
    await this.productStore.updateProduct(updated);
    await this.notifySeller(product.sellerId, `Product "${product.name}" is now published.`);
    return updated;
  }

  async unpublishProduct(input: SellerProductActionInput): Promise<Product> {
    const product = await this.requireOwnedProduct(input.productId, input.sellerId);
    if (product.status !== ProductStatus.Published) {
      throw new Error(`Product ${product.id} is not published.`);
    }

    await this.marketplace.unpublishListing({
      productId: product.id,
      sellerId: input.sellerId,
    });

    const updated = withProductStatus(product, ProductStatus.Hidden);
    await this.productStore.updateProduct(updated);
    return updated;
  }

  async archiveProduct(input: SellerProductActionInput): Promise<Product> {
    const product = await this.requireOwnedProduct(input.productId, input.sellerId);
    if (product.status === ProductStatus.Published) {
      throw new Error(`Product ${product.id} must be unpublished before archiving.`);
    }
    if (product.status === ProductStatus.Archived) {
      return product;
    }

    const updated = withProductStatus(product, ProductStatus.Archived);
    await this.productStore.updateProduct(updated);
    return updated;
  }

  async deleteProduct(input: SellerProductActionInput): Promise<void> {
    const product = await this.requireOwnedProduct(input.productId, input.sellerId);
    if (product.status !== ProductStatus.Draft && product.status !== ProductStatus.Archived) {
      throw new Error(`Product ${product.id} can only be deleted in Draft or Archived status.`);
    }

    await this.productStore.deleteProduct(product.id);
  }

  async getSellerProducts(sellerId: string): Promise<readonly Product[]> {
    await this.requireRegisteredSeller(sellerId);
    return this.productStore.findBySellerId(sellerId);
  }

  private async requireOwnedProduct(productId: string, sellerId: string): Promise<Product> {
    await this.requireRegisteredSeller(sellerId);
    const product = await this.requireProduct(productId);
    if (product.sellerId !== sellerId.trim()) {
      throw new Error(`Product ${productId} does not belong to seller ${sellerId}.`);
    }
    return product;
  }

  private async requireProduct(productId: string): Promise<Product> {
    const product = await this.products.getProduct(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
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

  private async notifySeller(sellerId: string, body: string): Promise<void> {
    const seller = await this.sellers.getSeller(sellerId);
    if (!seller) {
      return;
    }

    await this.notifications
      .send({
        channel: NotificationChannel.Email,
        recipient: createNotificationRecipient({
          type: NotificationRecipientType.Seller,
          id: seller.id,
          address: seller.profile.email,
        }),
        subject: "Product update",
        body,
      })
      .catch(() => undefined);
  }
}
