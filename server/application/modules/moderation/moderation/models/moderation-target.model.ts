/** Moderation subject types across the marketplace platform. */
export const ModerationTarget = {
  Seller: "seller",
  Product: "product",
  Listing: "listing",
  Review: "review",
  Complaint: "complaint",
} as const;

export type ModerationTargetValue = (typeof ModerationTarget)[keyof typeof ModerationTarget];

export const MODERATION_TARGET_VALUES: readonly ModerationTargetValue[] =
  Object.values(ModerationTarget);

export function isModerationTarget(value: string): value is ModerationTargetValue {
  return MODERATION_TARGET_VALUES.includes(value as ModerationTargetValue);
}
