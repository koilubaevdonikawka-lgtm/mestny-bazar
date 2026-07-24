import type { Seller } from "@server/application/modules/seller/seller/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps sellers to Supabase snapshot rows. */
export const SellerMapper = {
  toSnapshotRow(seller: Seller): SnapshotRow<Seller> {
    return toSnapshotRow(seller);
  },

  fromSnapshotRow(row: SnapshotRow<Seller> | null): Seller | null {
    return fromSnapshotRow(row);
  },
};
