import type { PickingList } from "@server/application/modules/warehouse/warehouse/models/picking-list.model";
import {
  WarehouseTaskStatus,
  type WarehouseTaskStatusValue,
} from "@server/application/modules/warehouse/warehouse/models/warehouse-task-status.model";
import type { WarehouseWorker } from "@server/application/modules/warehouse/warehouse/models/warehouse-worker.model";

/** Warehouse picking task owned by the Warehouse capability module. */
export interface WarehouseTask {
  readonly id: string;
  readonly orderId: string;
  readonly status: WarehouseTaskStatusValue;
  readonly pickingList: PickingList;
  readonly worker: WarehouseWorker | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly completedAt: string | null;
}

export function createWarehouseTask(input: {
  id: string;
  orderId: string;
  pickingList: PickingList;
}): WarehouseTask {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    orderId: input.orderId.trim(),
    status: WarehouseTaskStatus.Created,
    pickingList: input.pickingList,
    worker: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
  });
}

export function withWarehouseTaskWorker(
  task: WarehouseTask,
  worker: WarehouseWorker,
): WarehouseTask {
  return Object.freeze({
    ...task,
    worker,
    status: WarehouseTaskStatus.Assigned,
    updatedAt: new Date().toISOString(),
  });
}

export function withWarehouseTaskCompleted(task: WarehouseTask): WarehouseTask {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    ...task,
    status: WarehouseTaskStatus.Completed,
    updatedAt: timestamp,
    completedAt: timestamp,
  });
}
