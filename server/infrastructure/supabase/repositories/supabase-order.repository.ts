import type { IOrderRepository } from "@server/application/ports";
import type { Order, OrderReadModel } from "@server/domain/order";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { fromSnapshotRow, toOrderSnapshotRow } from "@server/infrastructure/supabase/mappers";
import { SupabaseSnapshotRepositoryBase } from "@server/infrastructure/supabase/repositories/supabase-snapshot-repository.base";
import { assertSupabaseSuccess, SupabaseSnapshotTables, type SnapshotRow } from "@server/infrastructure/supabase/shared";
import { reconstituteOrder } from "@server/infrastructure/shared";

/** Supabase-backed order repository using JSON snapshot persistence. */
export class SupabaseOrderRepository
  extends SupabaseSnapshotRepositoryBase<OrderReadModel>
  implements IOrderRepository
{
  constructor(clientProvider: ISupabaseClientProvider, configuration: SupabaseConfiguration) {
    super(clientProvider, configuration, SupabaseSnapshotTables.orders);
  }

  async save(order: Order): Promise<void> {
    const row = toOrderSnapshotRow(order.snapshot().toJSON());
    assertSupabaseSuccess(
      `${this.tableName}.upsert`,
      await this.table().upsert(row, { onConflict: "id" }),
    );
  }

  async findById(id: string): Promise<Order | null> {
    const model = await this.findSnapshotById(id);
    return model ? reconstituteOrder(model) : null;
  }

  async findSnapshotById(id: string): Promise<OrderReadModel | null> {
    return this.selectSnapshotById(id);
  }

  async findSnapshotByOrderNumber(orderNumber: string): Promise<OrderReadModel | null> {
    const row = assertSupabaseSuccess(
      `${this.tableName}.selectByOrderNumber`,
      await this.table()
        .select("id, order_number, snapshot, updated_at")
        .eq("order_number", orderNumber)
        .maybeSingle(),
    ) as (SnapshotRow<OrderReadModel> & { order_number: string }) | null;

    return fromSnapshotRow(row);
  }

  async exists(id: string): Promise<boolean> {
    return this.snapshotExists(id);
  }
}
