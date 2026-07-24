import { SellerLifecycleStatus } from "@server/domain/seller/status/seller-status";
import type { SellerLifecycleAction } from "@server/domain/seller/lifecycle/seller-lifecycle.types";

export type SellerTransitionMatrix = Record<
  SellerLifecycleStatus,
  Partial<Record<SellerLifecycleAction, SellerLifecycleStatus>>
>;

export const SELLER_TRANSITION_RULES: SellerTransitionMatrix = {
  [SellerLifecycleStatus.Registered]: {
    submit_verification: SellerLifecycleStatus.PendingVerification,
    archive: SellerLifecycleStatus.Archived,
  },
  [SellerLifecycleStatus.PendingVerification]: {
    verify: SellerLifecycleStatus.Verified,
    reject_verification: SellerLifecycleStatus.Registered,
    archive: SellerLifecycleStatus.Archived,
  },
  [SellerLifecycleStatus.Verified]: {
    activate: SellerLifecycleStatus.Active,
    archive: SellerLifecycleStatus.Archived,
  },
  [SellerLifecycleStatus.Active]: {
    suspend: SellerLifecycleStatus.Suspended,
    block: SellerLifecycleStatus.Blocked,
    archive: SellerLifecycleStatus.Archived,
  },
  [SellerLifecycleStatus.Suspended]: {
    reinstate: SellerLifecycleStatus.Active,
    block: SellerLifecycleStatus.Blocked,
    archive: SellerLifecycleStatus.Archived,
  },
  [SellerLifecycleStatus.Blocked]: {
    archive: SellerLifecycleStatus.Archived,
  },
  [SellerLifecycleStatus.Archived]: {},
};

export class SellerTransitionRules {
  static resolve(
    current: SellerLifecycleStatus,
    action: SellerLifecycleAction,
  ): SellerLifecycleStatus | undefined {
    return SELLER_TRANSITION_RULES[current][action];
  }

  static canResolve(current: SellerLifecycleStatus, action: SellerLifecycleAction): boolean {
    return SellerTransitionRules.resolve(current, action) !== undefined;
  }
}
