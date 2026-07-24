import type { InventoryItem, InventoryMovement } from "@server/application/modules/inventory/inventory/models";

export interface InventoryAdjustedEvent {
  readonly type: "inventory.adjusted";
  readonly item: InventoryItem;
  readonly movement: InventoryMovement;
  readonly occurredAt: string;
}

export function createInventoryAdjustedEvent(
  item: InventoryItem,
  movement: InventoryMovement,
): InventoryAdjustedEvent {
  return Object.freeze({
    type: "inventory.adjusted",
    item,
    movement,
    occurredAt: new Date().toISOString(),
  });
}
