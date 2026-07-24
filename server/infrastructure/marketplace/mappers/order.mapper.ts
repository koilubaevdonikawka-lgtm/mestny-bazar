import type { Order } from "@server/application/modules/order/order/models";
import { fromSnapshotRow, toOrderSnapshotRow } from "@server/infrastructure/supabase/mappers";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Maps order snapshots to Supabase rows. */
export const OrderMapper = {
  toSnapshotRow(order: Order): SnapshotRow<Order> & { order_number: string } {
    return toOrderSnapshotRow(order);
  },

  fromSnapshotRow(row: SnapshotRow<Order> | null): Order | null {
    return fromSnapshotRow(row);
  },
};
