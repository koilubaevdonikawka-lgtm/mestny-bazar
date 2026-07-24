import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess } from "@server/infrastructure/supabase/shared";
import type { SnapshotRow } from "@server/infrastructure/supabase/shared";
import { fromSnapshotRow, toSnapshotRow } from "@server/infrastructure/supabase/mappers";

/** Shared snapshot persistence helpers for Supabase repositories. */
export abstract class SupabaseSnapshotRepositoryBase<TReadModel extends { id: string; updatedAt: string }> {
  protected constructor(
    protected readonly clientProvider: ISupabaseClientProvider,
    protected readonly configuration: SupabaseConfiguration,
    protected readonly tableName: string,
  ) {}

  protected table() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(this.tableName);
    }
    return client.schema(this.configuration.schema).from(this.tableName);
  }

  protected async upsertSnapshot(snapshot: TReadModel): Promise<void> {
    const row = toSnapshotRow(snapshot);
    assertSupabaseSuccess(
      `${this.tableName}.upsert`,
      await this.table().upsert(row, { onConflict: "id" }),
    );
  }

  protected async selectSnapshotById(id: string): Promise<TReadModel | null> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.select`,
      await this.table().select("id, snapshot, updated_at").eq("id", id).maybeSingle(),
    );
    return fromSnapshotRow(data as SnapshotRow<TReadModel> | null);
  }

  protected async deleteSnapshotById(id: string): Promise<void> {
    assertSupabaseSuccess(
      `${this.tableName}.delete`,
      await this.table().delete().eq("id", id),
    );
  }

  protected async snapshotExists(id: string): Promise<boolean> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.exists`,
      await this.table().select("id").eq("id", id).maybeSingle(),
    );
    return Boolean(data);
  }
}
