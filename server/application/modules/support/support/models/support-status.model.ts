/** Support ticket lifecycle statuses. */
export const SupportStatus = {
  Open: "open",
  InProgress: "in_progress",
  Resolved: "resolved",
  Closed: "closed",
} as const;

export type SupportStatusValue = (typeof SupportStatus)[keyof typeof SupportStatus];

export const SUPPORT_STATUS_VALUES: readonly SupportStatusValue[] = Object.values(SupportStatus);

export function isSupportStatus(value: string): value is SupportStatusValue {
  return SUPPORT_STATUS_VALUES.includes(value as SupportStatusValue);
}

export function isOpenSupportStatus(status: SupportStatusValue): boolean {
  return status === SupportStatus.Open || status === SupportStatus.InProgress;
}

export function isClosedSupportStatus(status: SupportStatusValue): boolean {
  return status === SupportStatus.Closed || status === SupportStatus.Resolved;
}
