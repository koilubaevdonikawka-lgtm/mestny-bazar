/** Picking task lifecycle statuses. */
export const PickingStatus = {
  Pending: "Pending",
  Assigned: "Assigned",
  InProgress: "InProgress",
  Completed: "Completed",
  Cancelled: "Cancelled",
} as const;

export type PickingStatus = (typeof PickingStatus)[keyof typeof PickingStatus];

/** Warehouse picking task for order assembly. */
export interface PickingTask {
  readonly taskId: string;
  readonly orderId: string;
  readonly customerId: string;
  readonly pickerId: string | null;
  readonly status: PickingStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createPickingTask(input: {
  taskId: string;
  orderId: string;
  customerId: string;
}): PickingTask {
  const now = new Date().toISOString();
  return Object.freeze({
    taskId: input.taskId,
    orderId: input.orderId.trim(),
    customerId: input.customerId.trim(),
    pickerId: null,
    status: PickingStatus.Pending,
    createdAt: now,
    updatedAt: now,
  });
}

export function withPickingStatus(task: PickingTask, status: PickingStatus): PickingTask {
  return Object.freeze({
    ...task,
    status,
    updatedAt: new Date().toISOString(),
  });
}

export function withPickerId(task: PickingTask, pickerId: string): PickingTask {
  return Object.freeze({
    ...task,
    pickerId: pickerId.trim(),
    updatedAt: new Date().toISOString(),
  });
}

export function isPickingStatus(value: string): value is PickingStatus {
  return Object.values(PickingStatus).includes(value as PickingStatus);
}
