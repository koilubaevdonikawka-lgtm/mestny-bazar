import type { ModerationRequest } from "@server/application/modules/moderation/moderation/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps moderation requests to Supabase snapshot rows. */
export const ModerationRequestMapper = {
  toSnapshotRow(
    request: ModerationRequest,
  ): SnapshotRow<ModerationRequest> & { target: string; target_id: string } {
    return {
      id: request.id,
      target: request.target,
      target_id: request.targetId,
      snapshot: request,
      updated_at: request.updatedAt,
    };
  },

  fromSnapshotRow(
    row: (SnapshotRow<ModerationRequest> & { target?: string; target_id?: string }) | null,
  ): ModerationRequest | null {
    return fromSnapshotRow(row);
  },
};
