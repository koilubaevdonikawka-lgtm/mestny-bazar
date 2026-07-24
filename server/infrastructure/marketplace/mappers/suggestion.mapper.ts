import type { Suggestion } from "@server/application/modules/support/support/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps suggestions to Supabase snapshot rows. */
export const SuggestionMapper = {
  toSnapshotRow(suggestion: Suggestion): SnapshotRow<Suggestion> & { ticket_id: string } {
    return {
      id: suggestion.id,
      ticket_id: suggestion.ticketId,
      snapshot: suggestion,
      updated_at: suggestion.createdAt,
    };
  },

  fromSnapshotRow(
    row: (SnapshotRow<Suggestion> & { ticket_id?: string }) | null,
  ): Suggestion | null {
    return fromSnapshotRow(row);
  },
};
