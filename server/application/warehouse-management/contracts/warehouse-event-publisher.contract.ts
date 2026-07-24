import type { PickingStatus } from "@server/application/warehouse-management/models/picking-task.model";

export interface IWarehouseEventPublisher {
  publishPickingTaskCreated(taskId: string, orderId: string, customerId: string): Promise<void>;
  publishPickerAssigned(taskId: string, pickerId: string): Promise<void>;
  publishPickingCompleted(taskId: string, orderId: string): Promise<void>;
  publishPickingCancelled(taskId: string, orderId: string): Promise<void>;
  publishStatusChanged(
    taskId: string,
    status: PickingStatus,
    previousStatus: PickingStatus | null,
  ): Promise<void>;
}
