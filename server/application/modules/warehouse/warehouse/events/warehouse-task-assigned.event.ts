import type { WarehouseTaskStatusValue } from "@server/application/modules/warehouse/warehouse/models";

/** Raised when a warehouse worker is assigned to a task. */
export interface WarehouseTaskAssignedEvent {
  readonly type: "WarehouseTaskAssigned";
  readonly taskId: string;
  readonly orderId: string;
  readonly workerId: string;
  readonly status: WarehouseTaskStatusValue;
  readonly occurredAt: string;
}

export function createWarehouseTaskAssignedEvent(input: {
  taskId: string;
  orderId: string;
  workerId: string;
  status: WarehouseTaskStatusValue;
}): WarehouseTaskAssignedEvent {
  return Object.freeze({
    type: "WarehouseTaskAssigned",
    taskId: input.taskId,
    orderId: input.orderId,
    workerId: input.workerId,
    status: input.status,
    occurredAt: new Date().toISOString(),
  });
}
