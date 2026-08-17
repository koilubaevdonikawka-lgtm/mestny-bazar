import type {
  ProductPublicationContext,
  ProductPublicationResult,
} from "@server/ports/product-publication.port";
import type { ProductPublicationRule } from "@server/domain/product-publication/product-publication.rule";
import { ProductPublicationOrder } from "@server/domain/product-publication/product-publication-order";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";

/** Sets DRAFT as the initial publication status on seller product create. */
export class BootstrapDraftRule implements ProductPublicationRule {
  readonly order = ProductPublicationOrder.FINAL;

  applies(context: ProductPublicationContext): boolean {
    return (
      context.reason === "seller_create" && context.targetStatus === ProductPublicationStatus.DRAFT
    );
  }

  evaluate(_context: ProductPublicationContext): ProductPublicationResult {
    return { allowed: true };
  }
}
