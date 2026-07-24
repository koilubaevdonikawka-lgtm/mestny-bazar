import {
  InventoryStatus,
  type InventoryStatusValue,
} from "@server/application/modules/inventory/inventory/models/inventory-status.model";

/** Inventory item owned by the Inventory capability module. */
export interface InventoryItem {
  readonly productId: string;
  readonly quantity: number;
  readonly reservedQuantity: number;
  readonly status: InventoryStatusValue;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createInventoryItem(input: {
  productId: string;
  quantity: number;
}): InventoryItem {
  assertNonNegativeInteger(input.quantity, "Inventory quantity");

  const timestamp = new Date().toISOString();

  return Object.freeze({
    productId: input.productId.trim(),
    quantity: input.quantity,
    reservedQuantity: 0,
    status: input.quantity > 0 ? InventoryStatus.Active : InventoryStatus.Depleted,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function withInventoryQuantity(item: InventoryItem, quantity: number): InventoryItem {
  assertNonNegativeInteger(quantity, "Inventory quantity");

  return Object.freeze({
    ...item,
    quantity,
    status: quantity > 0 ? InventoryStatus.Active : InventoryStatus.Depleted,
    updatedAt: new Date().toISOString(),
  });
}

export function withInventoryReservedQuantity(
  item: InventoryItem,
  reservedQuantity: number,
): InventoryItem {
  assertNonNegativeInteger(reservedQuantity, "Reserved quantity");
  if (reservedQuantity > item.quantity) {
    throw new Error(
      `Reserved quantity ${reservedQuantity} exceeds on-hand quantity ${item.quantity} for product ${item.productId}.`,
    );
  }

  return Object.freeze({
    ...item,
    reservedQuantity,
    updatedAt: new Date().toISOString(),
  });
}

export function getAvailableInventoryQuantity(item: InventoryItem): number {
  return item.quantity - item.reservedQuantity;
}

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
}
