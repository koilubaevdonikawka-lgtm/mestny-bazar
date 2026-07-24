/** Canonical inventory item statuses. */
export const InventoryStatus = {
  Active: "active",
  Depleted: "depleted",
  Inactive: "inactive",
} as const;

export type InventoryStatusValue = (typeof InventoryStatus)[keyof typeof InventoryStatus];

export const INVENTORY_STATUS_VALUES: readonly InventoryStatusValue[] = Object.values(InventoryStatus);

export const InventoryReservationStatus = {
  Active: "active",
  Committed: "committed",
  Released: "released",
} as const;

export type InventoryReservationStatusValue =
  (typeof InventoryReservationStatus)[keyof typeof InventoryReservationStatus];

export function isInventoryStatus(value: string): value is InventoryStatusValue {
  return INVENTORY_STATUS_VALUES.includes(value as InventoryStatusValue);
}

export function isActiveInventoryReservation(
  status: InventoryReservationStatusValue,
): boolean {
  return status === InventoryReservationStatus.Active;
}
