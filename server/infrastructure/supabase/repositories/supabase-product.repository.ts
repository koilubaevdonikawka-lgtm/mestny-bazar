import type { IProductRepository } from "@server/application/ports";
import type { Product, ProductReadModel } from "@server/domain/product";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { SupabaseSnapshotRepositoryBase } from "@server/infrastructure/supabase/repositories/supabase-snapshot-repository.base";
import { SupabaseSnapshotTables } from "@server/infrastructure/supabase/shared";
import { reconstituteProduct } from "@server/infrastructure/shared";

/** Supabase-backed product repository using JSON snapshot persistence. */
export class SupabaseProductRepository
  extends SupabaseSnapshotRepositoryBase<ProductReadModel>
  implements IProductRepository
{
  constructor(clientProvider: ISupabaseClientProvider, configuration: SupabaseConfiguration) {
    super(clientProvider, configuration, SupabaseSnapshotTables.products);
  }

  async save(product: Product): Promise<void> {
    await this.upsertSnapshot(product.snapshot().toJSON());
  }

  async findById(id: string): Promise<Product | null> {
    const model = await this.findSnapshotById(id);
    return model ? reconstituteProduct(model) : null;
  }

  async findSnapshotById(id: string): Promise<ProductReadModel | null> {
    return this.selectSnapshotById(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.snapshotExists(id);
  }

  async delete(id: string): Promise<void> {
    await this.deleteSnapshotById(id);
  }
}
