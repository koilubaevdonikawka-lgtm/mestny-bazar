/** Support ticket priority levels. */
export const SupportPriority = {
  Low: "low",
  Normal: "normal",
  High: "high",
  Urgent: "urgent",
} as const;

export type SupportPriorityValue = (typeof SupportPriority)[keyof typeof SupportPriority];

export const SUPPORT_PRIORITY_VALUES: readonly SupportPriorityValue[] =
  Object.values(SupportPriority);

export function isSupportPriority(value: string): value is SupportPriorityValue {
  return SUPPORT_PRIORITY_VALUES.includes(value as SupportPriorityValue);
}
