import type { Review } from "@server/application/modules/reviews/reviews/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps product reviews to Supabase snapshot rows. */
export const ReviewMapper = {
  toSnapshotRow(review: Review): SnapshotRow<Review> & { product_id: string } {
    return {
      ...toSnapshotRow(review),
      product_id: review.productId,
    };
  },

  fromSnapshotRow(row: (SnapshotRow<Review> & { product_id?: string }) | null): Review | null {
    return fromSnapshotRow(row);
  },
};
