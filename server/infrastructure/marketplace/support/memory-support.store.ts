import type { ISupportStore } from "@server/application/modules/support/support/contracts";
import type {
  Complaint,
  Dispute,
  Suggestion,
  SupportTicket,
} from "@server/application/modules/support/support/models";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory support store for development and tests. */
export class MemorySupportStore implements ISupportStore {
  private readonly tickets = new InMemoryStore<SupportTicket>((ticket) => ticket.id);
  private readonly complaints = new InMemoryStore<Complaint>((complaint) => complaint.id);
  private readonly suggestions = new InMemoryStore<Suggestion>((suggestion) => suggestion.id);
  private readonly disputes = new InMemoryStore<Dispute>((dispute) => dispute.id);

  async saveTicket(ticket: SupportTicket): Promise<void> {
    this.tickets.set(ticket);
  }

  async updateTicket(ticket: SupportTicket): Promise<void> {
    if (!this.tickets.has(ticket.id)) {
      throw new Error(`Support ticket not found: ${ticket.id}`);
    }
    this.tickets.set(ticket);
  }

  async findTicketById(ticketId: string): Promise<SupportTicket | null> {
    return this.tickets.get(ticketId.trim()) ?? null;
  }

  async saveComplaint(complaint: Complaint): Promise<void> {
    this.complaints.set(complaint);
  }

  async findComplaintById(complaintId: string): Promise<Complaint | null> {
    return this.complaints.get(complaintId.trim()) ?? null;
  }

  async saveSuggestion(suggestion: Suggestion): Promise<void> {
    this.suggestions.set(suggestion);
  }

  async findSuggestionById(suggestionId: string): Promise<Suggestion | null> {
    return this.suggestions.get(suggestionId.trim()) ?? null;
  }

  async saveDispute(dispute: Dispute): Promise<void> {
    this.disputes.set(dispute);
  }

  async findDisputeById(disputeId: string): Promise<Dispute | null> {
    return this.disputes.get(disputeId.trim()) ?? null;
  }
}
