import type { InventoryItem } from "@server/application/modules/inventory/inventory/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps inventory items to Supabase snapshot rows. */
export const InventoryItemMapper = {
  toSnapshotRow(item: InventoryItem): SnapshotRow<InventoryItem> {
    return {
      id: item.productId,
      snapshot: item,
      updated_at: item.updatedAt,
    };
  },

  fromSnapshotRow(row: SnapshotRow<InventoryItem> | null): InventoryItem | null {
    return fromSnapshotRow(row);
  },
};
