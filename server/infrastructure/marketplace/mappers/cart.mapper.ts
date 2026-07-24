import type { CartSnapshot } from "@server/application/modules/cart/cart/models";
import type { CartStoreRecord } from "@server/infrastructure/marketplace/shared";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps cart snapshots to persistence records and Supabase rows. */
export const CartMapper = {
  toStoreRecord(snapshot: CartSnapshot): CartStoreRecord {
    return Object.freeze({
      id: snapshot.customerId,
      customerId: snapshot.customerId,
      items: Object.freeze([...snapshot.items]),
      totals: snapshot.totals,
      updatedAt: snapshot.updatedAt,
    });
  },

  fromStoreRecord(record: CartStoreRecord): CartSnapshot {
    return Object.freeze({
      customerId: record.customerId,
      items: Object.freeze([...record.items]),
      totals: record.totals,
      updatedAt: record.updatedAt,
    });
  },

  toSnapshotRow(record: CartStoreRecord): SnapshotRow<CartStoreRecord> {
    return toSnapshotRow(record);
  },

  fromSnapshotRow(row: SnapshotRow<CartStoreRecord> | null): CartStoreRecord | null {
    return fromSnapshotRow(row);
  },
};
