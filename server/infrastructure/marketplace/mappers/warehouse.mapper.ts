import type { WarehouseTask } from "@server/application/modules/warehouse/warehouse/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps warehouse tasks to Supabase snapshot rows. */
export const WarehouseMapper = {
  toSnapshotRow(task: WarehouseTask): SnapshotRow<WarehouseTask> & { order_id: string } {
    return {
      ...toSnapshotRow(task),
      order_id: task.orderId,
    };
  },

  fromSnapshotRow(
    row: (SnapshotRow<WarehouseTask> & { order_id?: string }) | null,
  ): WarehouseTask | null {
    return fromSnapshotRow(row);
  },
};
