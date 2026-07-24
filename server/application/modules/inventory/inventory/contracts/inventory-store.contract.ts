import type {
  InventoryItem,
  InventoryMovement,
  InventoryReservation,
} from "@server/application/modules/inventory/inventory/models";

/** Inventory persistence contract — implemented by infrastructure adapters. */
export interface IInventoryStore {
  saveInventoryItem(item: InventoryItem): Promise<void>;
  updateInventoryItem(item: InventoryItem): Promise<void>;
  findInventoryItemByProductId(productId: string): Promise<InventoryItem | null>;
  saveReservation(reservation: InventoryReservation): Promise<void>;
  updateReservation(reservation: InventoryReservation): Promise<void>;
  findReservationById(reservationId: string): Promise<InventoryReservation | null>;
  saveMovement(movement: InventoryMovement): Promise<void>;
}
