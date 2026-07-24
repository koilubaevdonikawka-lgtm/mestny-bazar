import type { IWarehouseStore } from "@server/application/modules/warehouse/warehouse/contracts";
import type { WarehouseTask } from "@server/application/modules/warehouse/warehouse/models";
import { WarehouseMapper } from "@server/infrastructure/marketplace/mappers";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed warehouse store using JSON snapshot persistence. */
export class SupabaseWarehouseStore implements IWarehouseStore {
  private readonly tableName = MarketplaceSnapshotTables.warehouseTasks;

  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async saveTask(task: WarehouseTask): Promise<void> {
    const row = WarehouseMapper.toSnapshotRow(task);
    assertSupabaseSuccess(
      `${this.tableName}.upsert`,
      await this.table().upsert(row, { onConflict: "id" }),
    );
  }

  async updateTask(task: WarehouseTask): Promise<void> {
    await this.saveTask(task);
  }

  async findById(taskId: string): Promise<WarehouseTask | null> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.select`,
      await this.table().select("id, order_id, snapshot, updated_at").eq("id", taskId).maybeSingle(),
    );
    return WarehouseMapper.fromSnapshotRow(
      data as (SnapshotRow<WarehouseTask> & { order_id?: string }) | null,
    );
  }

  async findByOrderId(orderId: string): Promise<readonly WarehouseTask[]> {
    const rows = assertSupabaseSuccess(
      `${this.tableName}.selectByOrder`,
      await this.table()
        .select("id, order_id, snapshot, updated_at")
        .eq("order_id", orderId),
    ) as Array<SnapshotRow<WarehouseTask> & { order_id: string }>;

    return Object.freeze(
      rows
        .map((row) => WarehouseMapper.fromSnapshotRow(row))
        .filter((task): task is WarehouseTask => task !== null)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
  }

  private table() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(this.tableName);
    }
    return client.schema(this.configuration.schema).from(this.tableName);
  }
}
