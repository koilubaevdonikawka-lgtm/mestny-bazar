import type { ICartStore } from "@server/application/modules/cart/cart/contracts";
import type { CartSnapshot } from "@server/application/modules/cart/cart/models";
import { CartMapper } from "@server/infrastructure/marketplace/mappers";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { CartStoreRecord } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed cart store using JSON snapshot persistence. */
export class SupabaseCartStore implements ICartStore {
  private readonly tableName = MarketplaceSnapshotTables.carts;

  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async loadCart(customerId: string): Promise<CartSnapshot | null> {
    const record = await this.selectByCustomerId(customerId);
    return record ? CartMapper.fromStoreRecord(record) : null;
  }

  async saveCart(snapshot: CartSnapshot): Promise<void> {
    const row = CartMapper.toSnapshotRow(CartMapper.toStoreRecord(snapshot));
    assertSupabaseSuccess(
      `${this.tableName}.upsert`,
      await this.table().upsert(row, { onConflict: "id" }),
    );
  }

  async deleteCart(customerId: string): Promise<void> {
    assertSupabaseSuccess(
      `${this.tableName}.delete`,
      await this.table().delete().eq("id", customerId),
    );
  }

  private table() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(this.tableName);
    }
    return client.schema(this.configuration.schema).from(this.tableName);
  }

  private async selectByCustomerId(customerId: string): Promise<CartStoreRecord | null> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.select`,
      await this.table().select("id, snapshot, updated_at").eq("id", customerId).maybeSingle(),
    );
    return CartMapper.fromSnapshotRow(data as SnapshotRow<CartStoreRecord> | null);
  }
}
