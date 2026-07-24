import {
  SupportTicketKind,
  type SupportTicketKindValue,
} from "@server/application/modules/support/support/models";

/** Routes support requests to the appropriate downstream handlers. */
export class SupportRoutingPolicy {
  shouldRouteToModeration(kind: SupportTicketKindValue): boolean {
    return kind === SupportTicketKind.Complaint;
  }

  shouldRouteToSupportTeam(kind: SupportTicketKindValue): boolean {
    return kind === SupportTicketKind.Dispute || kind === SupportTicketKind.General;
  }

  shouldRouteToFeedback(kind: SupportTicketKindValue): boolean {
    return kind === SupportTicketKind.Suggestion;
  }
}
