import type { WarehouseTaskStatusValue } from "@server/application/modules/warehouse/warehouse/models";

/** Raised when a warehouse task is created. */
export interface WarehouseTaskCreatedEvent {
  readonly type: "WarehouseTaskCreated";
  readonly taskId: string;
  readonly orderId: string;
  readonly status: WarehouseTaskStatusValue;
  readonly itemCount: number;
  readonly occurredAt: string;
}

export function createWarehouseTaskCreatedEvent(input: {
  taskId: string;
  orderId: string;
  status: WarehouseTaskStatusValue;
  itemCount: number;
}): WarehouseTaskCreatedEvent {
  return Object.freeze({
    type: "WarehouseTaskCreated",
    taskId: input.taskId,
    orderId: input.orderId,
    status: input.status,
    itemCount: input.itemCount,
    occurredAt: new Date().toISOString(),
  });
}
