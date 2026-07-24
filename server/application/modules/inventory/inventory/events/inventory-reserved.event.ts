import type { InventoryReservation } from "@server/application/modules/inventory/inventory/models";

export interface InventoryReservedEvent {
  readonly type: "inventory.reserved";
  readonly reservation: InventoryReservation;
  readonly occurredAt: string;
}

export function createInventoryReservedEvent(
  reservation: InventoryReservation,
): InventoryReservedEvent {
  return Object.freeze({
    type: "inventory.reserved",
    reservation,
    occurredAt: new Date().toISOString(),
  });
}
