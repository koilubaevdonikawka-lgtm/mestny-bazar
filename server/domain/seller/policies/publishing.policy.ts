import type { SellerPolicySnapshot } from "@server/domain/seller/policies/verification.policy";
import { SellerLifecycleStatus as Status } from "@server/domain/seller/status/seller-status";

/** Seller catalog operation permissions. */
export class PublishingPolicy {
  canCreateProducts(snapshot: SellerPolicySnapshot): boolean {
    return snapshot.status === Status.Active;
  }

  canPublishProducts(snapshot: SellerPolicySnapshot): boolean {
    return snapshot.status === Status.Active;
  }

  canEditProducts(snapshot: SellerPolicySnapshot): boolean {
    return snapshot.status === Status.Active || snapshot.status === Status.Verified;
  }

  canHideProducts(snapshot: SellerPolicySnapshot): boolean {
    return snapshot.status === Status.Active;
  }
}
