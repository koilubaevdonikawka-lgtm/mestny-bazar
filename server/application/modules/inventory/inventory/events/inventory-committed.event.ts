import type { InventoryReservation } from "@server/application/modules/inventory/inventory/models";

export interface InventoryCommittedEvent {
  readonly type: "inventory.committed";
  readonly reservation: InventoryReservation;
  readonly occurredAt: string;
}

export function createInventoryCommittedEvent(
  reservation: InventoryReservation,
): InventoryCommittedEvent {
  return Object.freeze({
    type: "inventory.committed",
    reservation,
    occurredAt: new Date().toISOString(),
  });
}
