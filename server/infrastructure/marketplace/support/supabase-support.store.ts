import type { ISupportStore } from "@server/application/modules/support/support/contracts";
import type {
  Complaint,
  Dispute,
  Suggestion,
  SupportTicket,
} from "@server/application/modules/support/support/models";
import {
  ComplaintMapper,
  DisputeMapper,
  SuggestionMapper,
  SupportTicketMapper,
} from "@server/infrastructure/marketplace/mappers";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed support store using JSON snapshot persistence. */
export class SupabaseSupportStore implements ISupportStore {
  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async saveTicket(ticket: SupportTicket): Promise<void> {
    const row = SupportTicketMapper.toSnapshotRow(ticket);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.supportTickets}.upsert`,
      await this.ticketTable().upsert(row, { onConflict: "id" }),
    );
  }

  async updateTicket(ticket: SupportTicket): Promise<void> {
    await this.saveTicket(ticket);
  }

  async findTicketById(ticketId: string): Promise<SupportTicket | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.supportTickets}.select`,
      await this.ticketTable()
        .select("id, requester_id, snapshot, updated_at")
        .eq("id", ticketId.trim())
        .maybeSingle(),
    );
    return SupportTicketMapper.fromSnapshotRow(
      data as SnapshotRow<SupportTicket> & { requester_id?: string } | null,
    );
  }

  async saveComplaint(complaint: Complaint): Promise<void> {
    const row = ComplaintMapper.toSnapshotRow(complaint);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.supportComplaints}.upsert`,
      await this.complaintTable().upsert(row, { onConflict: "id" }),
    );
  }

  async findComplaintById(complaintId: string): Promise<Complaint | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.supportComplaints}.select`,
      await this.complaintTable()
        .select("id, ticket_id, snapshot, updated_at")
        .eq("id", complaintId.trim())
        .maybeSingle(),
    );
    return ComplaintMapper.fromSnapshotRow(
      data as SnapshotRow<Complaint> & { ticket_id?: string } | null,
    );
  }

  async saveSuggestion(suggestion: Suggestion): Promise<void> {
    const row = SuggestionMapper.toSnapshotRow(suggestion);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.supportSuggestions}.upsert`,
      await this.suggestionTable().upsert(row, { onConflict: "id" }),
    );
  }

  async findSuggestionById(suggestionId: string): Promise<Suggestion | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.supportSuggestions}.select`,
      await this.suggestionTable()
        .select("id, ticket_id, snapshot, updated_at")
        .eq("id", suggestionId.trim())
        .maybeSingle(),
    );
    return SuggestionMapper.fromSnapshotRow(
      data as SnapshotRow<Suggestion> & { ticket_id?: string } | null,
    );
  }

  async saveDispute(dispute: Dispute): Promise<void> {
    const row = DisputeMapper.toSnapshotRow(dispute);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.supportDisputes}.upsert`,
      await this.disputeTable().upsert(row, { onConflict: "id" }),
    );
  }

  async findDisputeById(disputeId: string): Promise<Dispute | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.supportDisputes}.select`,
      await this.disputeTable()
        .select("id, ticket_id, snapshot, updated_at")
        .eq("id", disputeId.trim())
        .maybeSingle(),
    );
    return DisputeMapper.fromSnapshotRow(
      data as SnapshotRow<Dispute> & { ticket_id?: string } | null,
    );
  }

  private ticketTable() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(MarketplaceSnapshotTables.supportTickets);
    }
    return client.schema(this.configuration.schema).from(MarketplaceSnapshotTables.supportTickets);
  }

  private complaintTable() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(MarketplaceSnapshotTables.supportComplaints);
    }
    return client.schema(this.configuration.schema).from(MarketplaceSnapshotTables.supportComplaints);
  }

  private suggestionTable() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(MarketplaceSnapshotTables.supportSuggestions);
    }
    return client
      .schema(this.configuration.schema)
      .from(MarketplaceSnapshotTables.supportSuggestions);
  }

  private disputeTable() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(MarketplaceSnapshotTables.supportDisputes);
    }
    return client.schema(this.configuration.schema).from(MarketplaceSnapshotTables.supportDisputes);
  }
}
