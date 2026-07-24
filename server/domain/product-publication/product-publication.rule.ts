import type {
  ProductPublicationContext,
  ProductPublicationResult,
} from "@server/ports/product-publication.port";

export interface ProductPublicationRule {
  readonly order: number;
  readonly terminal?: boolean;
  applies(context: ProductPublicationContext): boolean;
  evaluate(context: ProductPublicationContext): ProductPublicationResult;
}
