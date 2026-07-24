import type { PickingStatus } from "@server/application/warehouse-management/models/picking-task.model";
import {
  AssignPickerUseCase,
  CancelPickingTaskUseCase,
  CompletePickingUseCase,
  CreatePickingTaskUseCase,
  GetPickingHistoryUseCase,
  GetPickingTaskUseCase,
  GetPickingTasksUseCase,
  UpdatePickingStatusUseCase,
} from "@server/application/warehouse-management/use-cases/warehouse-management.use-cases";

/** Application facade for warehouse management scenario. */
export class WarehouseManagementApplicationService {
  constructor(
    private readonly createPickingTaskUseCase: CreatePickingTaskUseCase,
    private readonly assignPickerUseCase: AssignPickerUseCase,
    private readonly updatePickingStatusUseCase: UpdatePickingStatusUseCase,
    private readonly completePickingUseCase: CompletePickingUseCase,
    private readonly getPickingTaskUseCase: GetPickingTaskUseCase,
    private readonly getPickingTasksUseCase: GetPickingTasksUseCase,
    private readonly cancelPickingTaskUseCase: CancelPickingTaskUseCase,
    private readonly getPickingHistoryUseCase: GetPickingHistoryUseCase,
  ) {}

  createPickingTask(orderId: string) {
    return this.createPickingTaskUseCase.execute(orderId);
  }

  assignPicker(taskId: string, pickerId: string) {
    return this.assignPickerUseCase.execute(taskId, pickerId);
  }

  updateStatus(taskId: string, status: PickingStatus, actor?: string, reason?: string) {
    return this.updatePickingStatusUseCase.execute(taskId, status, actor, reason);
  }

  completePicking(taskId: string) {
    return this.completePickingUseCase.execute(taskId);
  }

  getPickingTask(taskId: string) {
    return this.getPickingTaskUseCase.execute(taskId);
  }

  getPickingTasks() {
    return this.getPickingTasksUseCase.execute();
  }

  cancelPickingTask(taskId: string, reason?: string) {
    return this.cancelPickingTaskUseCase.execute(taskId, reason);
  }

  getHistory(taskId: string) {
    return this.getPickingHistoryUseCase.execute(taskId);
  }
}
