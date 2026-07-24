import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { CatalogModule } from "@server/application/modules/catalog/catalog/api/catalog.module";
import type { InventoryModule } from "@server/application/modules/inventory/inventory/api/inventory.module";
import type { PricingModule } from "@server/application/modules/pricing/pricing/api/pricing.module";
import { isValidPriceForPublication } from "@server/application/modules/pricing/pricing/models";
import type { ProductModule } from "@server/application/modules/product/product/api/product.module";
import { ProductStatus } from "@server/application/modules/product/product/models";
import type { SellerModule } from "@server/application/modules/seller/seller/api/seller.module";
import type { ServiceProvider } from "@server/infrastructure/di/service-container";

/** Validates marketplace publication prerequisites via public module APIs only. */
export class MarketplacePublicationPolicy {
  constructor(private readonly provider: ServiceProvider) {}

  async assertCanPublish(productId: string, sellerId: string): Promise<{ categoryId: string }> {
    const trimmedProductId = productId.trim();
    const trimmedSellerId = sellerId.trim();

    const sellers = this.provider.resolve<SellerModule>(BootstrapTokens.SellerModule);
    const approved = await sellers.isSellerApproved(trimmedSellerId);
    if (!approved) {
      throw new Error(`Seller ${trimmedSellerId} is not approved for marketplace publication.`);
    }

    const products = this.provider.resolve<ProductModule>(BootstrapTokens.ProductModule);
    const product = await products.getProduct(trimmedProductId);
    if (!product) {
      throw new Error(`Product not found: ${trimmedProductId}`);
    }
    if (product.sellerId !== trimmedSellerId) {
      throw new Error(
        `Product ${trimmedProductId} does not belong to seller ${trimmedSellerId}.`,
      );
    }
    if (product.status !== ProductStatus.ReadyForPublication) {
      throw new Error(`Product ${trimmedProductId} is not ready for marketplace publication.`);
    }

    const categoryId = product.attributes?.categoryId?.trim();
    if (!categoryId) {
      throw new Error(`Product ${trimmedProductId} category is required for marketplace publication.`);
    }

    const catalog = this.provider.resolve<CatalogModule>(BootstrapTokens.CatalogModule);
    const categoryPublished = await catalog.isCategoryPublished(categoryId);
    if (!categoryPublished) {
      throw new Error(`Category ${categoryId} is not published.`);
    }

    const pricing = this.provider.resolve<PricingModule>(BootstrapTokens.PricingModule);
    const price = await pricing.getCurrentPrice(trimmedProductId);
    if (!price || !isValidPriceForPublication(price)) {
      throw new Error(`Product ${trimmedProductId} does not have a valid published price.`);
    }

    const inventory = this.provider.resolve<InventoryModule>(BootstrapTokens.InventoryModule);
    const quantity = await inventory.getAvailableQuantity(trimmedProductId);
    if (quantity === null || quantity < 1) {
      throw new Error(`Product ${trimmedProductId} has insufficient inventory for publication.`);
    }

    return { categoryId };
  }
}
