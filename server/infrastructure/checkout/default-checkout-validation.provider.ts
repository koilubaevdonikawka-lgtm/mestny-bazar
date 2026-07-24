import type { ICatalogCheckoutReader } from "@server/application/checkout-management/contracts/catalog-checkout-reader.contract";
import type { ICheckoutValidationProvider } from "@server/application/checkout-management/contracts/checkout-validation-provider.contract";
import type { CheckoutLineDraft } from "@server/application/checkout-management/models/order-draft.model";
import type {
  CheckoutValidationIssue,
  CheckoutValidationResult,
} from "@server/application/checkout-management/models/checkout-view.model";

/** Default checkout validation using Catalog Management data only. */
export class DefaultCheckoutValidationProvider implements ICheckoutValidationProvider {
  constructor(private readonly catalogReader: ICatalogCheckoutReader) {}

  async validateDraft(
    _customerId: string,
    lines: readonly CheckoutLineDraft[],
  ): Promise<CheckoutValidationResult> {
    const issues: CheckoutValidationIssue[] = [];

    if (lines.length === 0) {
      return { valid: false, ready: false, issues: [{ code: "EMPTY_CART", message: "Cart is empty." }] };
    }

    const sellerIds = new Set<string>();

    for (const line of lines) {
      const product = await this.catalogReader.getProduct(line.productId);
      if (!product) {
        issues.push({
          code: "PRODUCT_NOT_IN_CATALOG",
          productId: line.productId,
          message: "Product is not available in catalog.",
        });
        continue;
      }

      if (product.price.amount !== line.unitPrice || product.price.currency !== line.currency) {
        issues.push({
          code: "PRICE_CHANGED",
          productId: line.productId,
          message: `Price changed: expected ${line.unitPrice} ${line.currency}, current ${product.price.amount} ${product.price.currency}.`,
        });
      }

      const availability = await this.catalogReader.checkAvailability(line.productId);
      if (!availability?.published) {
        issues.push({
          code: "PRODUCT_NOT_PUBLISHED",
          productId: line.productId,
          message: "Product is not published.",
        });
      } else if (!availability.available || availability.stockQuantity < line.quantity) {
        issues.push({
          code: "INSUFFICIENT_STOCK",
          productId: line.productId,
          message: `Insufficient stock: requested ${line.quantity}, available ${availability.stockQuantity}.`,
        });
      }

      sellerIds.add(line.sellerId);
    }

    for (const sellerId of sellerIds) {
      if (!(await this.catalogReader.isSellerAvailable(sellerId))) {
        issues.push({
          code: "SELLER_UNAVAILABLE",
          sellerId,
          message: `Seller is not available: ${sellerId}.`,
        });
      }
    }

    const valid = issues.length === 0;
    return Object.freeze({
      valid,
      ready: valid,
      issues: Object.freeze([...issues]),
    });
  }
}
