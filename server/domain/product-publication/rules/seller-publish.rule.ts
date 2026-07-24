import type {
  ProductPublicationContext,
  ProductPublicationResult,
} from "@server/ports/product-publication.port";
import type { ProductPublicationRule } from "@server/domain/product-publication/product-publication.rule";
import { ProductPublicationOrder } from "@server/domain/product-publication/product-publication-order";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";

const PUBLISHABLE_STATUSES = new Set<ProductPublicationStatus>([
  ProductPublicationStatus.DRAFT,
  ProductPublicationStatus.HIDDEN,
]);

/** Seller publishes a product: DRAFT/HIDDEN → PUBLISHED. */
export class SellerPublishRule implements ProductPublicationRule {
  readonly order = ProductPublicationOrder.TRANSITION_MATRIX;

  applies(context: ProductPublicationContext): boolean {
    return (
      context.reason === "seller_publish" &&
      context.targetStatus === ProductPublicationStatus.PUBLISHED
    );
  }

  evaluate(context: ProductPublicationContext): ProductPublicationResult {
    if (!PUBLISHABLE_STATUSES.has(context.currentStatus)) {
      return {
        allowed: false,
        denialCode: "INVALID_PUBLISH_TRANSITION",
        message: "Only draft or hidden products can be published",
      };
    }
    return { allowed: true };
  }
}
