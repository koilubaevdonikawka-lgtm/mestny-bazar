import type { ProductPolicySnapshot } from "@server/domain/product/policies/publication.policy";
import { ProductStatus, isTerminalProductStatus } from "@server/domain/product/status/product-status";

/** Visibility, editability, and archival permissions. */
export class VisibilityPolicy {
  canArchive(snapshot: ProductPolicySnapshot): boolean {
    return !isTerminalProductStatus(snapshot.status);
  }

  canHide(snapshot: ProductPolicySnapshot): boolean {
    return snapshot.status === ProductStatus.Published;
  }

  canEdit(snapshot: ProductPolicySnapshot): boolean {
    return (
      snapshot.status === ProductStatus.Draft ||
      snapshot.status === ProductStatus.PendingReview ||
      snapshot.status === ProductStatus.ReadyForPublication ||
      snapshot.status === ProductStatus.Hidden
    );
  }

  canChangeAttributes(snapshot: ProductPolicySnapshot): boolean {
    return this.canEdit(snapshot);
  }
}
