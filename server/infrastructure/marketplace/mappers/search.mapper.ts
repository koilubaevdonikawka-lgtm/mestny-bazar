import type { CategoryReadModel } from "@server/domain/catalog";
import type { ProductReadModel } from "@server/domain/product";
import type { SellerReadModel } from "@server/domain/seller";
import { fromSnapshotRow } from "@server/infrastructure/supabase/mappers";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Maps catalog read models from Supabase snapshot rows for search. */
export const SearchMapper = {
  productFromRow(row: SnapshotRow<ProductReadModel> | null): ProductReadModel | null {
    return fromSnapshotRow(row);
  },

  categoryFromRow(
    row: (SnapshotRow<CategoryReadModel> & { catalog_id?: string }) | null,
  ): CategoryReadModel | null {
    return fromSnapshotRow(row);
  },

  sellerFromRow(row: SnapshotRow<SellerReadModel> | null): SellerReadModel | null {
    return fromSnapshotRow(row);
  },
};
