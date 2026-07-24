import type { ICategoryRepository } from "@server/application/ports";
import type { Category, CategoryReadModel } from "@server/domain/catalog";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { toCategorySnapshotRow, fromSnapshotRow } from "@server/infrastructure/supabase/mappers";
import { SupabaseSnapshotRepositoryBase } from "@server/infrastructure/supabase/repositories/supabase-snapshot-repository.base";
import { assertSupabaseSuccess, SupabaseSnapshotTables, type SnapshotRow } from "@server/infrastructure/supabase/shared";
import { reconstituteCategory } from "@server/infrastructure/shared";

/** Supabase-backed category repository using JSON snapshot persistence. */
export class SupabaseCategoryRepository
  extends SupabaseSnapshotRepositoryBase<CategoryReadModel>
  implements ICategoryRepository
{
  constructor(clientProvider: ISupabaseClientProvider, configuration: SupabaseConfiguration) {
    super(clientProvider, configuration, SupabaseSnapshotTables.categories);
  }

  async save(category: Category): Promise<void> {
    const row = toCategorySnapshotRow(category.snapshot().toJSON());
    assertSupabaseSuccess(
      `${this.tableName}.upsert`,
      await this.table().upsert(row, { onConflict: "id" }),
    );
  }

  async findById(id: string): Promise<Category | null> {
    const model = await this.findSnapshotById(id);
    return model ? reconstituteCategory(model) : null;
  }

  async findSnapshotById(id: string): Promise<CategoryReadModel | null> {
    return this.selectSnapshotById(id);
  }

  async findSnapshotsByCatalogId(catalogId: string): Promise<CategoryReadModel[]> {
    const rows = assertSupabaseSuccess(
      `${this.tableName}.selectByCatalog`,
      await this.table()
        .select("id, catalog_id, snapshot, updated_at")
        .eq("catalog_id", catalogId),
    ) as Array<SnapshotRow<CategoryReadModel> & { catalog_id: string }>;

    return rows
      .map((row) => fromSnapshotRow(row))
      .filter((model): model is CategoryReadModel => model !== null);
  }

  async exists(id: string): Promise<boolean> {
    return this.snapshotExists(id);
  }
}
