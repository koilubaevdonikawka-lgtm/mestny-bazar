import type { ICatalogStore } from "@server/application/modules/catalog/catalog/contracts";
import type { Catalog, Category } from "@server/application/modules/catalog/catalog/models";
import { CatalogMapper, CategoryMapper } from "@server/infrastructure/marketplace/mappers";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed catalog store using JSON snapshot persistence. */
export class SupabaseCatalogStore implements ICatalogStore {
  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async saveCatalog(catalog: Catalog): Promise<void> {
    const row = CatalogMapper.toSnapshotRow(catalog);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.catalogs}.upsert`,
      await this.catalogTable().upsert(row, { onConflict: "id" }),
    );
  }

  async updateCatalog(catalog: Catalog): Promise<void> {
    await this.saveCatalog(catalog);
  }

  async findCatalogById(catalogId: string): Promise<Catalog | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.catalogs}.select`,
      await this.catalogTable().select("id, snapshot, updated_at").eq("id", catalogId).maybeSingle(),
    );
    return CatalogMapper.fromSnapshotRow(data as SnapshotRow<Catalog> | null);
  }

  async saveCategory(category: Category): Promise<void> {
    const row = CategoryMapper.toSnapshotRow(category);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.categories}.upsert`,
      await this.categoryTable().upsert(row, { onConflict: "id" }),
    );
  }

  async updateCategory(category: Category): Promise<void> {
    await this.saveCategory(category);
  }

  async findCategoryById(categoryId: string): Promise<Category | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.categories}.select`,
      await this.categoryTable()
        .select("id, catalog_id, snapshot, updated_at")
        .eq("id", categoryId)
        .maybeSingle(),
    );
    return CategoryMapper.fromSnapshotRow(
      data as (SnapshotRow<Category> & { catalog_id?: string }) | null,
    );
  }

  async findCategoriesByCatalogId(catalogId: string): Promise<readonly Category[]> {
    const rows = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.categories}.selectByCatalog`,
      await this.categoryTable()
        .select("id, catalog_id, snapshot, updated_at")
        .eq("catalog_id", catalogId),
    ) as Array<SnapshotRow<Category> & { catalog_id: string }>;

    return Object.freeze(
      rows
        .map((row) => CategoryMapper.fromSnapshotRow(row))
        .filter((category): category is Category => category !== null)
        .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name)),
    );
  }

  private catalogTable() {
    return this.table(MarketplaceSnapshotTables.catalogs);
  }

  private categoryTable() {
    return this.table(MarketplaceSnapshotTables.categories);
  }

  private table(tableName: string) {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(tableName);
    }
    return client.schema(this.configuration.schema).from(tableName);
  }
}
