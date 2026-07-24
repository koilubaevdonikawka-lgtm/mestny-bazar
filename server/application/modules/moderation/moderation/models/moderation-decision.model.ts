/** Final moderation decision applied to a request. */
export const ModerationDecision = {
  Approved: "approved",
  Rejected: "rejected",
  Cancelled: "cancelled",
} as const;

export type ModerationDecisionValue = (typeof ModerationDecision)[keyof typeof ModerationDecision];

export const MODERATION_DECISION_VALUES: readonly ModerationDecisionValue[] =
  Object.values(ModerationDecision);

export function isModerationDecision(value: string): value is ModerationDecisionValue {
  return MODERATION_DECISION_VALUES.includes(value as ModerationDecisionValue);
}
