import type { Discount } from "@server/application/modules/pricing/pricing/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps discounts to Supabase snapshot rows. */
export const DiscountMapper = {
  toSnapshotRow(discount: Discount): SnapshotRow<Discount> {
    return toSnapshotRow({
      ...discount,
      id: discount.id,
      updatedAt: discount.updatedAt,
    });
  },

  fromSnapshotRow(row: SnapshotRow<Discount> | null): Discount | null {
    return fromSnapshotRow(row);
  },
};
