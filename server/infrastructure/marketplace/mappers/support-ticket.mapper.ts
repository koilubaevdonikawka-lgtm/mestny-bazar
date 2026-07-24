import type { SupportTicket } from "@server/application/modules/support/support/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps support tickets to Supabase snapshot rows. */
export const SupportTicketMapper = {
  toSnapshotRow(
    ticket: SupportTicket,
  ): SnapshotRow<SupportTicket> & { requester_id: string } {
    return {
      id: ticket.id,
      requester_id: ticket.requesterId,
      snapshot: ticket,
      updated_at: ticket.updatedAt,
    };
  },

  fromSnapshotRow(
    row: (SnapshotRow<SupportTicket> & { requester_id?: string }) | null,
  ): SupportTicket | null {
    return fromSnapshotRow(row);
  },
};
