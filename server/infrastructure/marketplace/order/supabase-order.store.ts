import type { IOrderStore } from "@server/application/modules/order/order/contracts";
import type { Order } from "@server/application/modules/order/order/models";
import { OrderMapper } from "@server/infrastructure/marketplace/mappers";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import {
  assertSupabaseSuccess,
  SupabaseSnapshotTables,
  type SnapshotRow,
} from "@server/infrastructure/supabase/shared";

/** Supabase-backed order store using JSON snapshot persistence. */
export class SupabaseOrderStore implements IOrderStore {
  private readonly tableName = SupabaseSnapshotTables.orders;

  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async saveOrder(order: Order): Promise<void> {
    const row = OrderMapper.toSnapshotRow(order);
    assertSupabaseSuccess(
      `${this.tableName}.upsert`,
      await this.table().upsert(row, { onConflict: "id" }),
    );
  }

  async updateOrder(order: Order): Promise<void> {
    await this.saveOrder(order);
  }

  async findById(orderId: string): Promise<Order | null> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.select`,
      await this.table().select("id, order_number, snapshot, updated_at").eq("id", orderId).maybeSingle(),
    );
    return OrderMapper.fromSnapshotRow(data as SnapshotRow<Order> | null);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.selectByOrderNumber`,
      await this.table()
        .select("id, order_number, snapshot, updated_at")
        .eq("order_number", orderNumber)
        .maybeSingle(),
    );
    return OrderMapper.fromSnapshotRow(data as SnapshotRow<Order> | null);
  }

  async findByCustomerId(customerId: string): Promise<readonly Order[]> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.select`,
      await this.table().select("id, order_number, snapshot, updated_at"),
    );
    const rows = (data ?? []) as SnapshotRow<Order>[];
    return rows
      .map((row) => OrderMapper.fromSnapshotRow(row))
      .filter((order): order is Order => order !== null && order.customerId === customerId.trim())
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  private table() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(this.tableName);
    }
    return client.schema(this.configuration.schema).from(this.tableName);
  }
}
