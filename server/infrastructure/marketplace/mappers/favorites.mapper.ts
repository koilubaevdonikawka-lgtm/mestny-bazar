import type { FavoriteItem } from "@server/application/modules/favorites/favorites/models";
import type { FavoritesStoreRecord } from "@server/infrastructure/marketplace/shared";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps favorites collections to persistence records and Supabase rows. */
export const FavoritesMapper = {
  toStoreRecord(userId: string, items: readonly FavoriteItem[]): FavoritesStoreRecord {
    const updatedAt = new Date().toISOString();
    return Object.freeze({
      id: userId,
      userId,
      items: Object.freeze([...items]),
      updatedAt,
    });
  },

  fromStoreRecord(record: FavoritesStoreRecord): readonly FavoriteItem[] {
    return Object.freeze([...record.items]);
  },

  toSnapshotRow(record: FavoritesStoreRecord): SnapshotRow<FavoritesStoreRecord> {
    return toSnapshotRow(record);
  },

  fromSnapshotRow(row: SnapshotRow<FavoritesStoreRecord> | null): FavoritesStoreRecord | null {
    return fromSnapshotRow(row);
  },
};
