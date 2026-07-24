import type { ICatalogRepository } from "@server/application/ports";
import type { Catalog, CatalogReadModel } from "@server/domain/catalog";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { SupabaseSnapshotRepositoryBase } from "@server/infrastructure/supabase/repositories/supabase-snapshot-repository.base";
import { SupabaseSnapshotTables } from "@server/infrastructure/supabase/shared";
import { reconstituteCatalog } from "@server/infrastructure/shared";

/** Supabase-backed catalog repository using JSON snapshot persistence. */
export class SupabaseCatalogRepository
  extends SupabaseSnapshotRepositoryBase<CatalogReadModel>
  implements ICatalogRepository
{
  constructor(clientProvider: ISupabaseClientProvider, configuration: SupabaseConfiguration) {
    super(clientProvider, configuration, SupabaseSnapshotTables.catalogs);
  }

  async save(catalog: Catalog): Promise<void> {
    await this.upsertSnapshot(catalog.snapshot().toJSON());
  }

  async findById(id: string): Promise<Catalog | null> {
    const model = await this.findSnapshotById(id);
    return model ? reconstituteCatalog(model) : null;
  }

  async findSnapshotById(id: string): Promise<CatalogReadModel | null> {
    return this.selectSnapshotById(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.snapshotExists(id);
  }
}
