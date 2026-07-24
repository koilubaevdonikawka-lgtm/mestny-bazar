import {
  InventoryReservationStatus,
  type InventoryReservationStatusValue,
} from "@server/application/modules/inventory/inventory/models/inventory-status.model";

/** Inventory reservation owned by the Inventory capability module. */
export interface InventoryReservation {
  readonly id: string;
  readonly productId: string;
  readonly referenceId: string | null;
  readonly quantity: number;
  readonly status: InventoryReservationStatusValue;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createInventoryReservation(input: {
  id: string;
  productId: string;
  quantity: number;
  referenceId?: string | null;
}): InventoryReservation {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error("Reservation quantity must be a positive integer.");
  }

  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    productId: input.productId.trim(),
    referenceId: input.referenceId?.trim() || null,
    quantity: input.quantity,
    status: InventoryReservationStatus.Active,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function withInventoryReservationStatus(
  reservation: InventoryReservation,
  status: InventoryReservationStatusValue,
): InventoryReservation {
  return Object.freeze({
    ...reservation,
    status,
    updatedAt: new Date().toISOString(),
  });
}
