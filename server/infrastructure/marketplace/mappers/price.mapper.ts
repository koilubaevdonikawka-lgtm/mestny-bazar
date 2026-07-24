import type { Price } from "@server/application/modules/pricing/pricing/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps prices to Supabase snapshot rows. */
export const PriceMapper = {
  toSnapshotRow(price: Price): SnapshotRow<Price> & { product_id: string } {
    return {
      id: price.id,
      product_id: price.productId,
      snapshot: price,
      updated_at: price.updatedAt,
    };
  },

  fromSnapshotRow(row: (SnapshotRow<Price> & { product_id?: string }) | null): Price | null {
    return fromSnapshotRow(row);
  },
};
