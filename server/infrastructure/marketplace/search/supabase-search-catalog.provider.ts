import type { CategoryReadModel } from "@server/domain/catalog";
import type { ProductReadModel } from "@server/domain/product";
import type { SellerReadModel } from "@server/domain/seller";
import { SearchMapper } from "@server/infrastructure/marketplace/mappers";
import type { ISearchCatalogProvider } from "@server/application/modules/search/search/contracts";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, SupabaseSnapshotTables, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed search catalog provider reading existing snapshot tables. */
export class SupabaseSearchCatalogProvider implements ISearchCatalogProvider {
  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async products(): Promise<readonly ProductReadModel[]> {
    const rows = assertSupabaseSuccess(
      `${SupabaseSnapshotTables.products}.selectAll`,
      await this.table(SupabaseSnapshotTables.products).select("id, snapshot, updated_at"),
    ) as SnapshotRow<ProductReadModel>[];

    return Object.freeze(
      rows
        .map((row) => SearchMapper.productFromRow(row))
        .filter((model): model is ProductReadModel => model !== null),
    );
  }

  async categories(catalogId?: string): Promise<readonly CategoryReadModel[]> {
    const query = this.table(SupabaseSnapshotTables.categories).select(
      "id, catalog_id, snapshot, updated_at",
    );
    const rows = assertSupabaseSuccess(
      `${SupabaseSnapshotTables.categories}.selectAll`,
      catalogId ? await query.eq("catalog_id", catalogId) : await query,
    ) as Array<SnapshotRow<CategoryReadModel> & { catalog_id: string }>;

    return Object.freeze(
      rows
        .map((row) => SearchMapper.categoryFromRow(row))
        .filter((model): model is CategoryReadModel => model !== null),
    );
  }

  async sellers(): Promise<readonly SellerReadModel[]> {
    const rows = assertSupabaseSuccess(
      `${SupabaseSnapshotTables.sellers}.selectAll`,
      await this.table(SupabaseSnapshotTables.sellers).select("id, snapshot, updated_at"),
    ) as SnapshotRow<SellerReadModel>[];

    return Object.freeze(
      rows
        .map((row) => SearchMapper.sellerFromRow(row))
        .filter((model): model is SellerReadModel => model !== null),
    );
  }

  private table(tableName: string) {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(tableName);
    }
    return client.schema(this.configuration.schema).from(tableName);
  }
}
