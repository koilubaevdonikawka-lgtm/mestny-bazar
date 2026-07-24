/** Canonical warehouse task lifecycle statuses. */
export const WarehouseTaskStatus = {
  Created: "created",
  Assigned: "assigned",
  Completed: "completed",
} as const;

export type WarehouseTaskStatusValue =
  (typeof WarehouseTaskStatus)[keyof typeof WarehouseTaskStatus];

export const WAREHOUSE_TASK_STATUS_VALUES: readonly WarehouseTaskStatusValue[] =
  Object.values(WarehouseTaskStatus);

export function isWarehouseTaskStatus(value: string): value is WarehouseTaskStatusValue {
  return WAREHOUSE_TASK_STATUS_VALUES.includes(value as WarehouseTaskStatusValue);
}

export function assertWarehouseTaskStatus(value: string): WarehouseTaskStatusValue {
  if (!isWarehouseTaskStatus(value)) {
    throw new Error(`Unknown warehouse task status: ${value}`);
  }
  return value;
}
