import {
  SupportPriority,
  SupportTicketKind,
  type SupportPriorityValue,
  type SupportTicketKindValue,
} from "@server/application/modules/support/support/models";

/** Assigns support ticket priority based on request type and context. */
export class SupportPriorityPolicy {
  resolvePriority(
    kind: SupportTicketKindValue,
    context?: { orderId?: string | null; targetType?: string },
  ): SupportPriorityValue {
    if (kind === SupportTicketKind.Dispute) {
      return SupportPriority.Urgent;
    }

    if (kind === SupportTicketKind.Complaint) {
      if (context?.orderId || context?.targetType === "order") {
        return SupportPriority.High;
      }
      return SupportPriority.Normal;
    }

    if (kind === SupportTicketKind.Suggestion) {
      return SupportPriority.Low;
    }

    return SupportPriority.Normal;
  }
}
