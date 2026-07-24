import type { PriceRule } from "@server/application/modules/pricing/pricing/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps price rules to Supabase snapshot rows. */
export const PriceRuleMapper = {
  toSnapshotRow(rule: PriceRule): SnapshotRow<PriceRule> & { product_id: string } {
    return {
      ...toSnapshotRow({
        ...rule,
        id: rule.id,
        updatedAt: rule.updatedAt,
      }),
      product_id: rule.productId,
    };
  },

  fromSnapshotRow(
    row: (SnapshotRow<PriceRule> & { product_id?: string }) | null,
  ): PriceRule | null {
    return fromSnapshotRow(row);
  },
};
