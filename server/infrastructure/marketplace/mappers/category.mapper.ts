import type { Category } from "@server/application/modules/catalog/catalog/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps categories to Supabase snapshot rows. */
export const CategoryMapper = {
  toSnapshotRow(category: Category): SnapshotRow<Category> & { catalog_id: string } {
    return {
      ...toSnapshotRow(category),
      catalog_id: category.catalogId,
    };
  },

  fromSnapshotRow(
    row: (SnapshotRow<Category> & { catalog_id?: string }) | null,
  ): Category | null {
    return fromSnapshotRow(row);
  },
};
