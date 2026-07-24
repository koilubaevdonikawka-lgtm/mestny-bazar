/**
 * Cart Management — stores cart line positions only (Customer ↔ Product ↔ Quantity).
 *
 * Product data is fetched exclusively via ICatalogCartReader (Catalog Management).
 * Does NOT store or modify product entities. No Product BCM access.
 */
import type { ICatalogCartReader } from "@server/application/cart-management/contracts/catalog-cart-reader.contract";
import type { ICartAnalyticsProvider } from "@server/application/cart-management/contracts/cart-analytics-provider.contract";
import type { ICartEventPublisher } from "@server/application/cart-management/contracts/cart-event-publisher.contract";
import type { ICartInventoryProvider } from "@server/application/cart-management/contracts/cart-inventory-provider.contract";
import type {
  CartPricingLine,
  ICartPricingProvider,
} from "@server/application/cart-management/contracts/cart-pricing-provider.contract";
import type { ICartRepository } from "@server/application/cart-management/contracts/cart-repository.contract";
import type { CartLine } from "@server/application/cart-management/models/cart-line.model";
import type {
  CartTotalResult,
  CartValidationIssue,
  CartValidationResult,
  CartView,
  ClearCartResult,
  RemoveCartItemResult,
} from "@server/application/cart-management/models/cart-view.model";

export class CartManagementService {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly catalogReader: ICatalogCartReader,
    private readonly pricingProvider: ICartPricingProvider,
    private readonly inventoryProvider: ICartInventoryProvider,
    private readonly eventPublisher: ICartEventPublisher,
    private readonly analyticsProvider: ICartAnalyticsProvider,
  ) {}

  async addProduct(
    customerId: string,
    productId: string,
    quantity = 1,
  ): Promise<CartLine> {
    await this.ensureProductAvailable(productId, quantity);

    const existing = await this.cartRepository.findByCustomerId(customerId);
    const current = existing.find((line) => line.productId === productId.trim());
    const nextQuantity = (current?.quantity ?? 0) + quantity;
    await this.ensureProductAvailable(productId, nextQuantity);

    const line = await this.cartRepository.addItem(customerId, productId, quantity);
    await this.eventPublisher.publishItemAdded(customerId, productId, line.quantity);
    await this.analyticsProvider.trackItemAdded(customerId, productId, line.quantity);
    return line;
  }

  async updateQuantity(
    customerId: string,
    productId: string,
    quantity: number,
  ): Promise<CartLine | RemoveCartItemResult> {
    if (quantity <= 0) {
      const removed = await this.removeProduct(customerId, productId);
      return { removed: removed.removed };
    }

    if (!Number.isInteger(quantity)) {
      throw new Error("Quantity must be a positive integer.");
    }

    await this.ensureProductAvailable(productId, quantity);

    const line = await this.cartRepository.updateQuantity(customerId, productId, quantity);
    if (!line) {
      return { removed: false };
    }

    await this.eventPublisher.publishItemUpdated(customerId, productId, line.quantity);
    await this.analyticsProvider.trackItemUpdated(customerId, productId, line.quantity);
    return line;
  }

  async removeProduct(customerId: string, productId: string): Promise<RemoveCartItemResult> {
    const removed = await this.cartRepository.removeItem(customerId, productId);
    if (removed) {
      await this.eventPublisher.publishItemRemoved(customerId, productId);
      await this.analyticsProvider.trackItemRemoved(customerId, productId);
    }
    return { removed };
  }

  async getCart(customerId: string): Promise<CartView> {
    const lines = await this.cartRepository.findByCustomerId(customerId);
    const items = await this.buildItemViews(lines);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { items, itemCount };
  }

  async clearCart(customerId: string): Promise<ClearCartResult> {
    const removed = await this.cartRepository.clear(customerId);
    if (removed > 0) {
      await this.eventPublisher.publishCartCleared(customerId, removed);
      await this.analyticsProvider.trackCartCleared(customerId, removed);
    }
    return { removed };
  }

  async calculateTotal(customerId: string): Promise<CartTotalResult> {
    const cart = await this.getCart(customerId);
    const pricingLines = cart.items.map((item) => toPricingLine(item));
    const totals = this.pricingProvider.calculateCartTotal(pricingLines);
    return {
      subtotal: totals.subtotal,
      currency: totals.currency,
      itemCount: cart.itemCount,
    };
  }

  async validateCart(customerId: string): Promise<CartValidationResult> {
    const lines = await this.cartRepository.findByCustomerId(customerId);
    const issues: CartValidationIssue[] = [];

    for (const line of lines) {
      const product = await this.catalogReader.getProduct(line.productId);
      if (!product) {
        issues.push({
          productId: line.productId,
          message: "Product is not available in catalog.",
        });
        continue;
      }

      const availability = await this.catalogReader.checkAvailability(line.productId);
      if (!availability?.published) {
        issues.push({
          productId: line.productId,
          message: "Product is not published.",
        });
        continue;
      }

      const canFulfill = await this.inventoryProvider.canFulfill(line.productId, line.quantity);
      if (!canFulfill) {
        const stock = await this.inventoryProvider.getAvailableStock(line.productId);
        issues.push({
          productId: line.productId,
          message: `Insufficient stock: requested ${line.quantity}, available ${stock}.`,
        });
      }
    }

    const result = Object.freeze({
      valid: issues.length === 0,
      issues: Object.freeze([...issues]),
    });

    await this.analyticsProvider.trackCartValidated(customerId, result.valid, issues.length);
    return result;
  }

  private async ensureProductAvailable(productId: string, quantity: number): Promise<void> {
    const product = await this.catalogReader.getProduct(productId);
    if (!product) {
      throw new Error(`Product is not available in catalog: ${productId}`);
    }

    const canFulfill = await this.inventoryProvider.canFulfill(productId, quantity);
    if (!canFulfill) {
      const stock = await this.inventoryProvider.getAvailableStock(productId);
      throw new Error(
        `Insufficient stock for ${productId}: requested ${quantity}, available ${stock}.`,
      );
    }
  }

  private async buildItemViews(lines: readonly CartLine[]) {
    const productIds = lines.map((line) => line.productId);
    const products = await this.catalogReader.getProducts(productIds);
    const productMap = new Map(products.map((product) => [product.id, product]));

    return lines.map((line) => {
      const product = productMap.get(line.productId) ?? null;
      const unitPrice = product?.price.amount ?? 0;
      const currency = product?.price.currency ?? "KGS";
      const pricingLine: CartPricingLine = {
        productId: line.productId,
        quantity: line.quantity,
        unitPrice,
        currency,
      };

      return Object.freeze({
        productId: line.productId,
        quantity: line.quantity,
        product,
        unitPrice,
        currency,
        lineTotal: this.pricingProvider.calculateLineTotal(pricingLine),
      });
    });
  }
}

function toPricingLine(item: {
  productId: string;
  quantity: number;
  unitPrice: number;
  currency: string;
}): CartPricingLine {
  return {
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    currency: item.currency,
  };
}
