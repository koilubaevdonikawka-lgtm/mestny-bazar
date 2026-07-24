import type { Complaint } from "@server/application/modules/support/support/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps complaints to Supabase snapshot rows. */
export const ComplaintMapper = {
  toSnapshotRow(complaint: Complaint): SnapshotRow<Complaint> & { ticket_id: string } {
    return {
      id: complaint.id,
      ticket_id: complaint.ticketId,
      snapshot: complaint,
      updated_at: complaint.createdAt,
    };
  },

  fromSnapshotRow(
    row: (SnapshotRow<Complaint> & { ticket_id?: string }) | null,
  ): Complaint | null {
    return fromSnapshotRow(row);
  },
};
