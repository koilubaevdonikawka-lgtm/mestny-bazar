import type { ProductPolicySnapshot } from "@server/domain/product/policies/publication.policy";
import { ProductStatus } from "@server/domain/product/status/product-status";

/** Price mutation permissions. */
export class PricingPolicy {
  canChangePrice(snapshot: ProductPolicySnapshot): boolean {
    return (
      snapshot.status === ProductStatus.Draft ||
      snapshot.status === ProductStatus.PendingReview ||
      snapshot.status === ProductStatus.ReadyForPublication ||
      snapshot.status === ProductStatus.Published ||
      snapshot.status === ProductStatus.Hidden
    );
  }
}
