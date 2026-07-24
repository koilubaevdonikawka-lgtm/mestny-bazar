import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps analytics projections to Supabase snapshot rows. */
export const AnalyticsProjectionMapper = {
  toSnapshotRow<T extends { id: string; updatedAt: string }>(
    projectionId: string,
    projection: T,
  ): SnapshotRow<T> & { projection_id: string } {
    return {
      id: projectionId,
      projection_id: projectionId,
      snapshot: projection,
      updated_at: projection.updatedAt,
    };
  },

  fromSnapshotRow<T>(
    row: (SnapshotRow<T> & { projection_id?: string }) | null,
  ): T | null {
    return fromSnapshotRow(row);
  },
};
