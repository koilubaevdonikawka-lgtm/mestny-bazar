import type { IInventoryStore } from "@server/application/modules/inventory/inventory/contracts";
import type {
  InventoryItem,
  InventoryMovement,
  InventoryReservation,
} from "@server/application/modules/inventory/inventory/models";
import {
  InventoryItemMapper,
  InventoryMovementMapper,
  InventoryReservationMapper,
} from "@server/infrastructure/marketplace/mappers";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed inventory store using JSON snapshot persistence. */
export class SupabaseInventoryStore implements IInventoryStore {
  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async saveInventoryItem(item: InventoryItem): Promise<void> {
    const row = InventoryItemMapper.toSnapshotRow(item);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.inventoryItems}.upsert`,
      await this.itemTable().upsert(row, { onConflict: "id" }),
    );
  }

  async updateInventoryItem(item: InventoryItem): Promise<void> {
    await this.saveInventoryItem(item);
  }

  async findInventoryItemByProductId(productId: string): Promise<InventoryItem | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.inventoryItems}.select`,
      await this.itemTable().select("id, snapshot, updated_at").eq("id", productId).maybeSingle(),
    );
    return InventoryItemMapper.fromSnapshotRow(data as SnapshotRow<InventoryItem> | null);
  }

  async saveReservation(reservation: InventoryReservation): Promise<void> {
    const row = InventoryReservationMapper.toSnapshotRow(reservation);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.inventoryReservations}.upsert`,
      await this.reservationTable().upsert(row, { onConflict: "id" }),
    );
  }

  async updateReservation(reservation: InventoryReservation): Promise<void> {
    await this.saveReservation(reservation);
  }

  async findReservationById(reservationId: string): Promise<InventoryReservation | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.inventoryReservations}.select`,
      await this.reservationTable()
        .select("id, product_id, snapshot, updated_at")
        .eq("id", reservationId)
        .maybeSingle(),
    );
    return InventoryReservationMapper.fromSnapshotRow(
      data as (SnapshotRow<InventoryReservation> & { product_id?: string }) | null,
    );
  }

  async saveMovement(movement: InventoryMovement): Promise<void> {
    const row = InventoryMovementMapper.toSnapshotRow(movement);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.inventoryMovements}.upsert`,
      await this.movementTable().upsert(row, { onConflict: "id" }),
    );
  }

  private itemTable() {
    return this.table(MarketplaceSnapshotTables.inventoryItems);
  }

  private reservationTable() {
    return this.table(MarketplaceSnapshotTables.inventoryReservations);
  }

  private movementTable() {
    return this.table(MarketplaceSnapshotTables.inventoryMovements);
  }

  private table(tableName: string) {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(tableName);
    }
    return client.schema(this.configuration.schema).from(tableName);
  }
}
