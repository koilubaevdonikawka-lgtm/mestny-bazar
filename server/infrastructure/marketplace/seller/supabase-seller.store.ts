import type { ISellerStore } from "@server/application/modules/seller/seller/contracts";
import type { Seller } from "@server/application/modules/seller/seller/models";
import { SellerMapper } from "@server/infrastructure/marketplace/mappers";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed seller store using JSON snapshot persistence. */
export class SupabaseSellerStore implements ISellerStore {
  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async saveSeller(seller: Seller): Promise<void> {
    const row = SellerMapper.toSnapshotRow(seller);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.sellers}.upsert`,
      await this.sellerTable().upsert(row, { onConflict: "id" }),
    );
  }

  async updateSeller(seller: Seller): Promise<void> {
    await this.saveSeller(seller);
  }

  async findSellerById(sellerId: string): Promise<Seller | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.sellers}.select`,
      await this.sellerTable().select("id, snapshot, updated_at").eq("id", sellerId).maybeSingle(),
    );
    return SellerMapper.fromSnapshotRow(data as SnapshotRow<Seller> | null);
  }

  private sellerTable() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(MarketplaceSnapshotTables.sellers);
    }
    return client.schema(this.configuration.schema).from(MarketplaceSnapshotTables.sellers);
  }
}
