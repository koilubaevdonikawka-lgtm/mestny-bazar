import type { MarketplaceListing } from "@server/application/modules/marketplace/marketplace/models";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Maps marketplace listings to Supabase snapshot rows. */
export const MarketplaceListingMapper = {
  toSnapshotRow(
    listing: MarketplaceListing,
  ): SnapshotRow<MarketplaceListing> & { product_id: string } {
    return {
      id: listing.id,
      product_id: listing.productId,
      snapshot: listing,
      updated_at: listing.updatedAt,
    };
  },

  fromSnapshotRow(
    row: (SnapshotRow<MarketplaceListing> & { product_id?: string }) | null,
  ): MarketplaceListing | null {
    return fromSnapshotRow(row);
  },
};
