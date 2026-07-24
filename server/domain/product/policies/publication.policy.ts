import type { ProductAttributes } from "@server/domain/product/value-objects/product-attributes.vo";
import type { ProductInventory } from "@server/domain/product/value-objects/product-inventory.vo";
import type { ProductMedia } from "@server/domain/product/value-objects/product-media.vo";
import type { ProductPrice } from "@server/domain/product/value-objects/product-price.vo";
import { ProductStatus } from "@server/domain/product/status/product-status";

export interface ProductPolicySnapshot {
  status: ProductStatus;
  price: ProductPrice;
  inventory: ProductInventory;
  media: ProductMedia;
  attributes: ProductAttributes;
}

/** Publication readiness and listing requirements. */
export class PublicationPolicy {
  canPublish(snapshot: ProductPolicySnapshot): boolean {
    if (snapshot.status !== ProductStatus.ReadyForPublication) {
      return false;
    }

    return (
      snapshot.media.hasMinimumPhotos() &&
      snapshot.price.isValidForPublication() &&
      snapshot.inventory.isAvailableForSale()
    );
  }

  canChangeMedia(snapshot: ProductPolicySnapshot): boolean {
    return (
      snapshot.status === ProductStatus.Draft ||
      snapshot.status === ProductStatus.PendingReview ||
      snapshot.status === ProductStatus.ReadyForPublication ||
      snapshot.status === ProductStatus.Hidden ||
      snapshot.status === ProductStatus.Published
    );
  }
}
