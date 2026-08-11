import type {
  ProductPublicationContext,
  ProductPublicationResult,
} from "@server/ports/product-publication.port";
import type { ProductPublicationRule } from "@server/domain/product-publication/product-publication.rule";
import { ProductPublicationOrder } from "@server/domain/product-publication/product-publication-order";

/**
 * Admin Catalog product management (Промпт №1, new series) has full
 * authority over publication status — unlike sellers, who are restricted to
 * the DRAFT/PUBLISHED/HIDDEN matrix enforced by SellerPublishRule/SellerHideRule.
 * Extends the existing rule engine (server/domain/product-publication) rather
 * than adding a parallel policy mechanism.
 */
export class AdminFullControlRule implements ProductPublicationRule {
  readonly order = ProductPublicationOrder.TRANSITION_MATRIX;

  applies(context: ProductPublicationContext): boolean {
    return context.reason === "admin_create" || context.reason === "admin_update";
  }

  evaluate(_context: ProductPublicationContext): ProductPublicationResult {
    return { allowed: true };
  }
}
