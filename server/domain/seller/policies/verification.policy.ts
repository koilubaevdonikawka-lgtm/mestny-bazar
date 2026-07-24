import type { SellerLifecycleStatus } from "@server/domain/seller/status/seller-status";
import { SellerLifecycleStatus as Status } from "@server/domain/seller/status/seller-status";
import type { SellerVerification } from "@server/domain/seller/value-objects/seller-verification.vo";

export interface SellerPolicySnapshot {
  status: SellerLifecycleStatus;
  verification: SellerVerification;
}

export class VerificationPolicy {
  canSubmitVerification(snapshot: SellerPolicySnapshot): boolean {
    if (snapshot.status !== Status.Registered) {
      return false;
    }
    const level = snapshot.verification.levelValue();
    return level === "none" || level === "rejected";
  }

  canResubmitDocuments(snapshot: SellerPolicySnapshot): boolean {
    return (
      snapshot.status === Status.Registered &&
      snapshot.verification.levelValue() === "rejected"
    );
  }

  canActivate(snapshot: SellerPolicySnapshot): boolean {
    return snapshot.status === Status.Verified && snapshot.verification.isVerified();
  }
}
