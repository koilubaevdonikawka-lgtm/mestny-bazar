import type { Product } from "@server/application/modules/product/product/models";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Maps product snapshots to Supabase rows. */
export const ProductMapper = {
  toSnapshotRow(product: Product): SnapshotRow<Product> {
    return toSnapshotRow(product);
  },

  fromSnapshotRow(row: SnapshotRow<Product> | null): Product | null {
    return fromSnapshotRow(row);
  },
};
