import type { IMarketplaceStore } from "@server/application/modules/marketplace/marketplace/contracts";
import type { MarketplaceListing } from "@server/application/modules/marketplace/marketplace/models";
import { MarketplaceListingMapper } from "@server/infrastructure/marketplace/mappers";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed marketplace listing store using JSON snapshot persistence. */
export class SupabaseMarketplaceStore implements IMarketplaceStore {
  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async saveListing(listing: MarketplaceListing): Promise<void> {
    const row = MarketplaceListingMapper.toSnapshotRow(listing);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.listings}.upsert`,
      await this.listingTable().upsert(row, { onConflict: "id" }),
    );
  }

  async updateListing(listing: MarketplaceListing): Promise<void> {
    await this.saveListing(listing);
  }

  async findListingById(listingId: string): Promise<MarketplaceListing | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.listings}.select`,
      await this.listingTable()
        .select("id, snapshot, updated_at")
        .eq("id", listingId.trim())
        .maybeSingle(),
    );
    return MarketplaceListingMapper.fromSnapshotRow(data as SnapshotRow<MarketplaceListing> | null);
  }

  async findListingByProductId(productId: string): Promise<MarketplaceListing | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.listings}.selectByProduct`,
      await this.listingTable()
        .select("id, product_id, snapshot, updated_at")
        .eq("product_id", productId.trim())
        .maybeSingle(),
    );
    return MarketplaceListingMapper.fromSnapshotRow(
      data as (SnapshotRow<MarketplaceListing> & { product_id?: string }) | null,
    );
  }

  private listingTable() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(MarketplaceSnapshotTables.listings);
    }
    return client.schema(this.configuration.schema).from(MarketplaceSnapshotTables.listings);
  }
}
