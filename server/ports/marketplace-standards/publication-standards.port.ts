import type {
  IProductPublicationPolicy,
  ProductPublicationContext,
  ProductPublicationResult,
} from "@server/ports/product-publication.port";

/**
 * Publication standards — product visibility lifecycle.
 * Currently delegates to Product Publication Policy; rules migrate here later.
 */
export const PUBLICATION_STANDARDS_DOMAIN = "publication" as const;

export interface IPublicationStandards extends IProductPublicationPolicy {
  readonly domain: typeof PUBLICATION_STANDARDS_DOMAIN;
}

export type { ProductPublicationContext, ProductPublicationResult };
