import type {
  ProductPublicationContext,
  ProductPublicationResult,
} from "@server/ports/product-publication.port";
import type { ProductPublicationRule } from "@server/domain/product-publication/product-publication.rule";
import { ProductPublicationOrder } from "@server/domain/product-publication/product-publication-order";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";

/** Seller hides a product: PUBLISHED → HIDDEN. */
export class SellerHideRule implements ProductPublicationRule {
  readonly order = ProductPublicationOrder.TRANSITION_MATRIX;

  applies(context: ProductPublicationContext): boolean {
    return (
      context.reason === "seller_hide" && context.targetStatus === ProductPublicationStatus.HIDDEN
    );
  }

  evaluate(context: ProductPublicationContext): ProductPublicationResult {
    if (context.currentStatus !== ProductPublicationStatus.PUBLISHED) {
      return {
        allowed: false,
        denialCode: "INVALID_HIDE_TRANSITION",
        message: "Only published products can be hidden",
      };
    }
    return { allowed: true };
  }
}
