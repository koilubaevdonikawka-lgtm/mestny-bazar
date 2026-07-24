import type { IProductPublicationPolicy } from "@server/ports/product-publication.port";
import type {
  ProductPublicationContext,
  ProductPublicationResult,
} from "@server/ports/product-publication.port";
import {
  PUBLICATION_STANDARDS_DOMAIN,
  type IPublicationStandards,
} from "@server/ports/marketplace-standards/publication-standards.port";

/**
 * Publication standards — bridge to Product Publication Policy.
 * Seller flows keep using productPublication directly until migration completes.
 */
export class PublicationStandardsService implements IPublicationStandards {
  readonly domain = PUBLICATION_STANDARDS_DOMAIN;

  constructor(private readonly policy: IProductPublicationPolicy) {}

  canTransition(context: ProductPublicationContext): ProductPublicationResult {
    return this.policy.canTransition(context);
  }

  assertCanTransition(context: ProductPublicationContext): void {
    this.policy.assertCanTransition(context);
  }
}
