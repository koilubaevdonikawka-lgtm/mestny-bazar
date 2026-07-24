import type { SellerLimitsUsage } from "@server/domain/seller/policies/seller-limits.policy";
import { SellerLimitsPolicy } from "@server/domain/seller/policies/seller-limits.policy";
import { PublishingPolicy } from "@server/domain/seller/policies/publishing.policy";
import { SuspensionPolicy } from "@server/domain/seller/policies/suspension.policy";
import { VerificationPolicy, type SellerPolicySnapshot } from "@server/domain/seller/policies/verification.policy";
import type { SellerLimits } from "@server/domain/seller/value-objects/seller-limits.vo";

/** Coordinates specialized seller policies. */
export class SellerPolicy {
  private readonly verification = new VerificationPolicy();
  private readonly publishing = new PublishingPolicy();
  private readonly limits = new SellerLimitsPolicy();
  private readonly suspension = new SuspensionPolicy();

  canSubmitVerification(snapshot: SellerPolicySnapshot): boolean {
    return this.verification.canSubmitVerification(snapshot);
  }

  canResubmitDocuments(snapshot: SellerPolicySnapshot): boolean {
    return this.verification.canResubmitDocuments(snapshot);
  }

  canActivate(snapshot: SellerPolicySnapshot): boolean {
    return this.verification.canActivate(snapshot);
  }

  canCreateProducts(snapshot: SellerPolicySnapshot): boolean {
    return this.publishing.canCreateProducts(snapshot);
  }

  canPublishProducts(snapshot: SellerPolicySnapshot): boolean {
    return this.publishing.canPublishProducts(snapshot);
  }

  canEditProducts(snapshot: SellerPolicySnapshot): boolean {
    return this.publishing.canEditProducts(snapshot);
  }

  canHideProducts(snapshot: SellerPolicySnapshot): boolean {
    return this.publishing.canHideProducts(snapshot);
  }

  canCreateProduct(limits: SellerLimits, usage: SellerLimitsUsage): boolean {
    return this.limits.canCreateProduct(limits, usage);
  }

  canPublishProduct(limits: SellerLimits, usage: SellerLimitsUsage): boolean {
    return this.limits.canPublishProduct(limits, usage);
  }

  canAddImage(limits: SellerLimits, usage: SellerLimitsUsage): boolean {
    return this.limits.canAddImage(limits, usage);
  }

  canUseCategory(limits: SellerLimits, usage: SellerLimitsUsage): boolean {
    return this.limits.canUseCategory(limits, usage);
  }

  canUseExtension(limits: SellerLimits, key: string, currentValue: number): boolean {
    return this.limits.canUseExtension(limits, key, currentValue);
  }

  canSuspend(snapshot: SellerPolicySnapshot): boolean {
    return this.suspension.canSuspend(snapshot);
  }

  canReinstate(snapshot: SellerPolicySnapshot): boolean {
    return this.suspension.canReinstate(snapshot);
  }

  canBlock(snapshot: SellerPolicySnapshot): boolean {
    return this.suspension.canBlock(snapshot);
  }

  canArchive(snapshot: SellerPolicySnapshot): boolean {
    return this.suspension.canArchive(snapshot);
  }

  canUpdateProfile(snapshot: SellerPolicySnapshot): boolean {
    return this.suspension.canUpdateProfile(snapshot);
  }
}

export {
  VerificationPolicy,
  PublishingPolicy,
  SellerLimitsPolicy,
  SuspensionPolicy,
};

export type { SellerPolicySnapshot, SellerLimitsUsage };
