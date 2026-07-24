import type { ProductPolicySnapshot } from "@server/domain/product/policies/publication.policy";
import { InventoryPolicy } from "@server/domain/product/policies/inventory.policy";
import { PricingPolicy } from "@server/domain/product/policies/pricing.policy";
import { PublicationPolicy } from "@server/domain/product/policies/publication.policy";
import { VisibilityPolicy } from "@server/domain/product/policies/visibility.policy";

/** Coordinates specialized product policies — backward-compatible facade. */
export class ProductPolicy {
  private readonly publication = new PublicationPolicy();
  private readonly pricing = new PricingPolicy();
  private readonly inventory = new InventoryPolicy();
  private readonly visibility = new VisibilityPolicy();

  canPublish(snapshot: ProductPolicySnapshot): boolean {
    return this.publication.canPublish(snapshot);
  }

  canArchive(snapshot: ProductPolicySnapshot): boolean {
    return this.visibility.canArchive(snapshot);
  }

  canHide(snapshot: ProductPolicySnapshot): boolean {
    return this.visibility.canHide(snapshot);
  }

  canEdit(snapshot: ProductPolicySnapshot): boolean {
    return this.visibility.canEdit(snapshot);
  }

  canChangePrice(snapshot: ProductPolicySnapshot): boolean {
    return this.pricing.canChangePrice(snapshot);
  }

  canChangeInventory(snapshot: ProductPolicySnapshot): boolean {
    return this.inventory.canChangeInventory(snapshot);
  }

  canChangeMedia(snapshot: ProductPolicySnapshot): boolean {
    return this.publication.canChangeMedia(snapshot);
  }

  canChangeAttributes(snapshot: ProductPolicySnapshot): boolean {
    return this.visibility.canChangeAttributes(snapshot);
  }
}

export {
  PublicationPolicy,
  PricingPolicy,
  InventoryPolicy,
  VisibilityPolicy,
};
