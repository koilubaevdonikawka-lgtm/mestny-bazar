import type { InventoryReservation } from "@server/application/modules/inventory/inventory/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps inventory reservations to Supabase snapshot rows. */
export const InventoryReservationMapper = {
  toSnapshotRow(
    reservation: InventoryReservation,
  ): SnapshotRow<InventoryReservation> & { product_id: string } {
    return {
      ...toSnapshotRow({
        ...reservation,
        id: reservation.id,
        updatedAt: reservation.updatedAt,
      }),
      product_id: reservation.productId,
    };
  },

  fromSnapshotRow(
    row: (SnapshotRow<InventoryReservation> & { product_id?: string }) | null,
  ): InventoryReservation | null {
    return fromSnapshotRow(row);
  },
};
