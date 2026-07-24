import type { IWarehouseEventPublisher } from "@server/application/warehouse-management/contracts/warehouse-event-publisher.contract";
import type { PickingStatus } from "@server/application/warehouse-management/models/picking-task.model";

/** No-op event publisher until Notification BCM is connected. */
export class NoopWarehouseEventPublisher implements IWarehouseEventPublisher {
  async publishPickingTaskCreated(
    _taskId: string,
    _orderId: string,
    _customerId: string,
  ): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishPickerAssigned(_taskId: string, _pickerId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishPickingCompleted(_taskId: string, _orderId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishPickingCancelled(_taskId: string, _orderId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishStatusChanged(
    _taskId: string,
    _status: PickingStatus,
    _previousStatus: PickingStatus | null,
  ): Promise<void> {
    // Reserved for Notification BCM integration.
  }
}
