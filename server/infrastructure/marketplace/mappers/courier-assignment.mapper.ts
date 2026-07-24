import type { CourierAssignment } from "@server/application/modules/courier/courier/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps courier assignments to Supabase snapshot rows. */
export const CourierAssignmentMapper = {
  toSnapshotRow(
    assignment: CourierAssignment,
  ): SnapshotRow<CourierAssignment> & { order_id: string; courier_id: string } {
    return {
      ...toSnapshotRow(assignment),
      order_id: assignment.orderId,
      courier_id: assignment.courierId,
    };
  },

  fromSnapshotRow(
    row: (SnapshotRow<CourierAssignment> & { order_id?: string; courier_id?: string }) | null,
  ): CourierAssignment | null {
    return fromSnapshotRow(row);
  },
};
