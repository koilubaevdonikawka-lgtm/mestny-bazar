/** Moderation request lifecycle statuses. */
export const ModerationStatus = {
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected",
  Cancelled: "cancelled",
} as const;

export type ModerationStatusValue = (typeof ModerationStatus)[keyof typeof ModerationStatus];

export const MODERATION_STATUS_VALUES: readonly ModerationStatusValue[] =
  Object.values(ModerationStatus);

export function isModerationStatus(value: string): value is ModerationStatusValue {
  return MODERATION_STATUS_VALUES.includes(value as ModerationStatusValue);
}

export function isApprovedModerationStatus(status: ModerationStatusValue): boolean {
  return status === ModerationStatus.Approved;
}

export function isPendingModerationStatus(status: ModerationStatusValue): boolean {
  return status === ModerationStatus.Pending;
}
