/** Support ticket kinds handled by the Support capability module. */
export const SupportTicketKind = {
  General: "general",
  Complaint: "complaint",
  Suggestion: "suggestion",
  Dispute: "dispute",
} as const;

export type SupportTicketKindValue = (typeof SupportTicketKind)[keyof typeof SupportTicketKind];

export const SUPPORT_TICKET_KIND_VALUES: readonly SupportTicketKindValue[] =
  Object.values(SupportTicketKind);

export function isSupportTicketKind(value: string): value is SupportTicketKindValue {
  return SUPPORT_TICKET_KIND_VALUES.includes(value as SupportTicketKindValue);
}
