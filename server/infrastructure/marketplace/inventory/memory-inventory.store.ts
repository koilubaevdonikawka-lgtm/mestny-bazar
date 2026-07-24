import type { IInventoryStore } from "@server/application/modules/inventory/inventory/contracts";
import type {
  InventoryItem,
  InventoryMovement,
  InventoryReservation,
} from "@server/application/modules/inventory/inventory/models";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory inventory store for development and tests. */
export class MemoryInventoryStore implements IInventoryStore {
  private readonly items = new InMemoryStore<InventoryItem>((item) => item.productId);
  private readonly reservations = new InMemoryStore<InventoryReservation>((reservation) => reservation.id);
  private readonly movements = new InMemoryStore<InventoryMovement>((movement) => movement.id);

  async saveInventoryItem(item: InventoryItem): Promise<void> {
    this.items.set(item);
  }

  async updateInventoryItem(item: InventoryItem): Promise<void> {
    if (!this.items.has(item.productId)) {
      throw new Error(`Inventory item not found for product ${item.productId}.`);
    }
    this.items.set(item);
  }

  async findInventoryItemByProductId(productId: string): Promise<InventoryItem | null> {
    return this.items.get(productId) ?? null;
  }

  async saveReservation(reservation: InventoryReservation): Promise<void> {
    this.reservations.set(reservation);
  }

  async updateReservation(reservation: InventoryReservation): Promise<void> {
    if (!this.reservations.has(reservation.id)) {
      throw new Error(`Inventory reservation not found: ${reservation.id}.`);
    }
    this.reservations.set(reservation);
  }

  async findReservationById(reservationId: string): Promise<InventoryReservation | null> {
    return this.reservations.get(reservationId) ?? null;
  }

  async saveMovement(movement: InventoryMovement): Promise<void> {
    this.movements.set(movement);
  }
}
