import type { InventoryMovement } from "@server/application/modules/inventory/inventory/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps inventory movements to Supabase snapshot rows. */
export const InventoryMovementMapper = {
  toSnapshotRow(
    movement: InventoryMovement,
  ): SnapshotRow<InventoryMovement> & { product_id: string } {
    return {
      id: movement.id,
      product_id: movement.productId,
      snapshot: movement,
      updated_at: movement.occurredAt,
    };
  },

  fromSnapshotRow(
    row: (SnapshotRow<InventoryMovement> & { product_id?: string }) | null,
  ): InventoryMovement | null {
    return fromSnapshotRow(row);
  },
};
