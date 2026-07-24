import type { InventoryReservation } from "@server/application/modules/inventory/inventory/models";

export interface InventoryReleasedEvent {
  readonly type: "inventory.released";
  readonly reservation: InventoryReservation;
  readonly occurredAt: string;
}

export function createInventoryReleasedEvent(
  reservation: InventoryReservation,
): InventoryReleasedEvent {
  return Object.freeze({
    type: "inventory.released",
    reservation,
    occurredAt: new Date().toISOString(),
  });
}
