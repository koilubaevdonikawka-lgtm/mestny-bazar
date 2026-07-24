/** Canonical seller moderation statuses. */
export const SellerStatus = {
  Pending: "pending",
  Approved: "approved",
  Suspended: "suspended",
} as const;

export type SellerStatusValue = (typeof SellerStatus)[keyof typeof SellerStatus];

export const SELLER_STATUS_VALUES: readonly SellerStatusValue[] = Object.values(SellerStatus);

export function isSellerStatus(value: string): value is SellerStatusValue {
  return SELLER_STATUS_VALUES.includes(value as SellerStatusValue);
}

export function assertSellerStatus(value: string): SellerStatusValue {
  if (!isSellerStatus(value)) {
    throw new Error(`Unknown seller status: ${value}`);
  }
  return value;
}

export function isApprovedSellerStatus(status: SellerStatusValue): boolean {
  return status === SellerStatus.Approved;
}
