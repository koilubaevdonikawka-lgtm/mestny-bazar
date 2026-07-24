import type { Promotion } from "@server/application/modules/pricing/pricing/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps promotions to Supabase snapshot rows. */
export const PromotionMapper = {
  toSnapshotRow(promotion: Promotion): SnapshotRow<Promotion> {
    return toSnapshotRow({
      ...promotion,
      id: promotion.id,
      updatedAt: promotion.updatedAt,
    });
  },

  fromSnapshotRow(row: SnapshotRow<Promotion> | null): Promotion | null {
    return fromSnapshotRow(row);
  },
};
