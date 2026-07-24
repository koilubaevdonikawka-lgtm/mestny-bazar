import type { PickingTask } from "@server/application/warehouse-management/models/picking-task.model";

export interface IWarehouseRepository {
  save(task: PickingTask): Promise<void>;
  findById(taskId: string): Promise<PickingTask | null>;
  findByOrderId(orderId: string): Promise<readonly PickingTask[]>;
  findAll(): Promise<readonly PickingTask[]>;
  update(task: PickingTask): Promise<void>;
}
