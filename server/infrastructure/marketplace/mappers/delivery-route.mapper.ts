import type { DeliveryRoute } from "@server/application/modules/courier/courier/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps delivery routes to Supabase snapshot rows. */
export const DeliveryRouteMapper = {
  toSnapshotRow(
    route: DeliveryRoute,
  ): SnapshotRow<DeliveryRoute> & { assignment_id: string; order_id: string } {
    return {
      ...toSnapshotRow(route),
      assignment_id: route.assignmentId,
      order_id: route.orderId,
    };
  },

  fromSnapshotRow(
    row: (SnapshotRow<DeliveryRoute> & { assignment_id?: string; order_id?: string }) | null,
  ): DeliveryRoute | null {
    return fromSnapshotRow(row);
  },
};
