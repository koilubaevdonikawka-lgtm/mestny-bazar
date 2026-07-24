import type {
  IProductPublicationPolicy,
  ProductPublicationContext,
  ProductPublicationResult,
} from "@server/ports/product-publication.port";
import type { ProductPublicationRule } from "@server/domain/product-publication/product-publication.rule";
import { ProductPublicationDeniedError } from "@server/domain/product-publication/product-publication.errors";

function sortRulesByOrder(rules: ProductPublicationRule[]): ProductPublicationRule[] {
  return [...rules].sort((a, b) => a.order - b.order);
}

/**
 * Universal rule engine for product publication status transitions.
 * Rule order and membership are composed in DI Container — not hardcoded here.
 */
export class ProductPublicationService implements IProductPublicationPolicy {
  private readonly rules: ProductPublicationRule[];

  constructor(rules: ProductPublicationRule[]) {
    this.rules = sortRulesByOrder(rules);
  }

  canTransition(context: ProductPublicationContext): ProductPublicationResult {
    for (const rule of this.rules) {
      if (!rule.applies(context)) continue;

      const result = rule.evaluate(context);
      if (!result.allowed) return result;

      const isTerminal = rule.terminal !== false;
      if (isTerminal) return result;
    }

    return {
      allowed: false,
      denialCode: "NO_MATCHING_RULE",
      message: "No publication policy rule matched the transition request",
    };
  }

  assertCanTransition(context: ProductPublicationContext): void {
    const result = this.canTransition(context);
    if (result.allowed) return;

    throw new ProductPublicationDeniedError(
      result.denialCode ?? "PRODUCT_PUBLICATION_DENIED",
      result.message ?? "Product publication transition is not allowed",
    );
  }
}
