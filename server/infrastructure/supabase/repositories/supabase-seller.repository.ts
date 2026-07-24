import type { ISellerRepository } from "@server/application/ports";
import type { Seller, SellerReadModel } from "@server/domain/seller";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { SupabaseSnapshotRepositoryBase } from "@server/infrastructure/supabase/repositories/supabase-snapshot-repository.base";
import { SupabaseSnapshotTables } from "@server/infrastructure/supabase/shared";
import { reconstituteSeller } from "@server/infrastructure/shared";

/** Supabase-backed seller repository using JSON snapshot persistence. */
export class SupabaseSellerRepository
  extends SupabaseSnapshotRepositoryBase<SellerReadModel>
  implements ISellerRepository
{
  constructor(clientProvider: ISupabaseClientProvider, configuration: SupabaseConfiguration) {
    super(clientProvider, configuration, SupabaseSnapshotTables.sellers);
  }

  async save(seller: Seller): Promise<void> {
    await this.upsertSnapshot(seller.snapshot().toJSON());
  }

  async findById(id: string): Promise<Seller | null> {
    const model = await this.findSnapshotById(id);
    return model ? reconstituteSeller(model) : null;
  }

  async findSnapshotById(id: string): Promise<SellerReadModel | null> {
    return this.selectSnapshotById(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.snapshotExists(id);
  }
}
