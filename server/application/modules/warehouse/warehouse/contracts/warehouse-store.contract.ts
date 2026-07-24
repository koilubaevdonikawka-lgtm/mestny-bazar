import type { WarehouseTask } from "@server/application/modules/warehouse/warehouse/models";

/** Warehouse persistence contract — implemented by infrastructure adapters. */
export interface IWarehouseStore {
  saveTask(task: WarehouseTask): Promise<void>;
  updateTask(task: WarehouseTask): Promise<void>;
  findById(taskId: string): Promise<WarehouseTask | null>;
  findByOrderId(orderId: string): Promise<readonly WarehouseTask[]>;
}
