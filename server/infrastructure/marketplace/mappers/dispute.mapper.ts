import type { Dispute } from "@server/application/modules/support/support/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps disputes to Supabase snapshot rows. */
export const DisputeMapper = {
  toSnapshotRow(dispute: Dispute): SnapshotRow<Dispute> & { ticket_id: string } {
    return {
      id: dispute.id,
      ticket_id: dispute.ticketId,
      snapshot: dispute,
      updated_at: dispute.createdAt,
    };
  },

  fromSnapshotRow(
    row: (SnapshotRow<Dispute> & { ticket_id?: string }) | null,
  ): Dispute | null {
    return fromSnapshotRow(row);
  },
};
