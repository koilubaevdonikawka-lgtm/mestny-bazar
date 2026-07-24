import { InvalidSellerStatusError, SellerLifecycleViolationError } from "@server/domain/seller/exceptions/seller.errors";

/** Canonical seller lifecycle statuses. */
export const SellerLifecycleStatus = {
  Registered: "Registered",
  PendingVerification: "PendingVerification",
  Verified: "Verified",
  Active: "Active",
  Suspended: "Suspended",
  Blocked: "Blocked",
  Archived: "Archived",
} as const;

export type SellerLifecycleStatus =
  (typeof SellerLifecycleStatus)[keyof typeof SellerLifecycleStatus];

export const SELLER_LIFECYCLE_STATUS_VALUES: readonly SellerLifecycleStatus[] =
  Object.values(SellerLifecycleStatus);

export function isSellerLifecycleStatus(value: string): value is SellerLifecycleStatus {
  return SELLER_LIFECYCLE_STATUS_VALUES.includes(value as SellerLifecycleStatus);
}

export function assertSellerLifecycleStatus(value: string): SellerLifecycleStatus {
  if (!isSellerLifecycleStatus(value)) {
    throw new SellerLifecycleViolationError(`Unknown seller status: ${value}`, value, value);
  }
  return value;
}

export function isTerminalSellerStatus(status: SellerLifecycleStatus): boolean {
  return status === SellerLifecycleStatus.Archived || status === SellerLifecycleStatus.Blocked;
}

export function isOperationalSellerStatus(status: SellerLifecycleStatus): boolean {
  return status === SellerLifecycleStatus.Active;
}
