import type { IFavoritesStore } from "@server/application/modules/favorites/favorites/contracts";
import type { FavoriteItem } from "@server/application/modules/favorites/favorites/models";
import { FavoritesMapper } from "@server/infrastructure/marketplace/mappers";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { FavoritesStoreRecord } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed favorites store using JSON snapshot persistence. */
export class SupabaseFavoritesStore implements IFavoritesStore {
  private readonly tableName = MarketplaceSnapshotTables.favorites;

  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async loadFavorites(userId: string): Promise<readonly FavoriteItem[]> {
    const record = await this.selectByUserId(userId);
    return record ? FavoritesMapper.fromStoreRecord(record) : Object.freeze([]);
  }

  async saveFavorites(userId: string, items: readonly FavoriteItem[]): Promise<void> {
    const row = FavoritesMapper.toSnapshotRow(FavoritesMapper.toStoreRecord(userId, items));
    assertSupabaseSuccess(
      `${this.tableName}.upsert`,
      await this.table().upsert(row, { onConflict: "id" }),
    );
  }

  async removeFavorite(userId: string, productId: string): Promise<boolean> {
    const record = await this.selectByUserId(userId);
    if (!record) {
      return false;
    }

    const items = record.items.filter((item) => item.productId !== productId);
    if (items.length === record.items.length) {
      return false;
    }

    await this.saveFavorites(userId, items);
    return true;
  }

  private table() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(this.tableName);
    }
    return client.schema(this.configuration.schema).from(this.tableName);
  }

  private async selectByUserId(userId: string): Promise<FavoritesStoreRecord | null> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.select`,
      await this.table().select("id, snapshot, updated_at").eq("id", userId).maybeSingle(),
    );
    return FavoritesMapper.fromSnapshotRow(data as SnapshotRow<FavoritesStoreRecord> | null);
  }
}
