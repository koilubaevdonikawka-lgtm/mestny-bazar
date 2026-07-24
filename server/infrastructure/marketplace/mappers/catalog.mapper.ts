import type { Catalog } from "@server/application/modules/catalog/catalog/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps catalogs to Supabase snapshot rows. */
export const CatalogMapper = {
  toSnapshotRow(catalog: Catalog): SnapshotRow<Catalog> {
    return toSnapshotRow(catalog);
  },

  fromSnapshotRow(row: SnapshotRow<Catalog> | null): Catalog | null {
    return fromSnapshotRow(row);
  },
};
