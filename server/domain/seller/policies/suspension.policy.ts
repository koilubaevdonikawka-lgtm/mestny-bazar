import type { SellerPolicySnapshot } from "@server/domain/seller/policies/verification.policy";
import { SellerLifecycleStatus as Status } from "@server/domain/seller/status/seller-status";
import { isTerminalSellerStatus } from "@server/domain/seller/status/seller-status";

/** Suspension, reinstatement, and blocking permissions. */
export class SuspensionPolicy {
  canSuspend(snapshot: SellerPolicySnapshot): boolean {
    return snapshot.status === Status.Active;
  }

  canReinstate(snapshot: SellerPolicySnapshot): boolean {
    return snapshot.status === Status.Suspended;
  }

  canBlock(snapshot: SellerPolicySnapshot): boolean {
    return snapshot.status === Status.Active || snapshot.status === Status.Suspended;
  }

  canArchive(snapshot: SellerPolicySnapshot): boolean {
    return !isTerminalSellerStatus(snapshot.status);
  }

  canUpdateProfile(snapshot: SellerPolicySnapshot): boolean {
    return (
      snapshot.status === Status.Registered ||
      snapshot.status === Status.PendingVerification ||
      snapshot.status === Status.Verified ||
      snapshot.status === Status.Active ||
      snapshot.status === Status.Suspended
    );
  }
}
