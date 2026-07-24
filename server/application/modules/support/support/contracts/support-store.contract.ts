import type {
  Complaint,
  Dispute,
  Suggestion,
  SupportTicket,
} from "@server/application/modules/support/support/models";

/** Support persistence contract — implemented by infrastructure adapters. */
export interface ISupportStore {
  saveTicket(ticket: SupportTicket): Promise<void>;
  updateTicket(ticket: SupportTicket): Promise<void>;
  findTicketById(ticketId: string): Promise<SupportTicket | null>;
  saveComplaint(complaint: Complaint): Promise<void>;
  findComplaintById(complaintId: string): Promise<Complaint | null>;
  saveSuggestion(suggestion: Suggestion): Promise<void>;
  findSuggestionById(suggestionId: string): Promise<Suggestion | null>;
  saveDispute(dispute: Dispute): Promise<void>;
  findDisputeById(disputeId: string): Promise<Dispute | null>;
}
