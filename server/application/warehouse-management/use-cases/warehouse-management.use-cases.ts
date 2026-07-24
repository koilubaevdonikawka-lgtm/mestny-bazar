import type { PickingTask } from "@server/application/warehouse-management/models/picking-task.model";
import type { PickingStatus } from "@server/application/warehouse-management/models/picking-task.model";
import type {
  AssignPickerResult,
  CancelPickingTaskResult,
  CompletePickingResult,
  PickingHistoryView,
  PickingTasksListResult,
} from "@server/application/warehouse-management/models/picking-history.model";
import type { WarehouseManagementService } from "@server/application/warehouse-management/services/warehouse-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class CreatePickingTaskUseCase {
  constructor(private readonly warehouse: WarehouseManagementService) {}

  execute(orderId: string): Promise<UseCaseResult<PickingTask>> {
    return this.warehouse.createPickingTask(orderId).then(useCaseResult);
  }
}

export class AssignPickerUseCase {
  constructor(private readonly warehouse: WarehouseManagementService) {}

  execute(taskId: string, pickerId: string): Promise<UseCaseResult<AssignPickerResult>> {
    return this.warehouse.assignPicker(taskId, pickerId).then(useCaseResult);
  }
}

export class UpdatePickingStatusUseCase {
  constructor(private readonly warehouse: WarehouseManagementService) {}

  execute(
    taskId: string,
    status: PickingStatus,
    actor?: string,
    reason?: string,
  ): Promise<UseCaseResult<PickingTask>> {
    return this.warehouse.updatePickingStatus(taskId, status, actor, reason).then(useCaseResult);
  }
}

export class CompletePickingUseCase {
  constructor(private readonly warehouse: WarehouseManagementService) {}

  execute(taskId: string): Promise<UseCaseResult<CompletePickingResult>> {
    return this.warehouse.completePicking(taskId).then(useCaseResult);
  }
}

export class GetPickingTaskUseCase {
  constructor(private readonly warehouse: WarehouseManagementService) {}

  async execute(taskId: string): Promise<UseCaseResult<PickingTask | null>> {
    return useCaseResult(await this.warehouse.getPickingTask(taskId));
  }
}

export class GetPickingTasksUseCase {
  constructor(private readonly warehouse: WarehouseManagementService) {}

  execute(): Promise<UseCaseResult<PickingTasksListResult>> {
    return this.warehouse.getPickingTasks().then(useCaseResult);
  }
}

export class CancelPickingTaskUseCase {
  constructor(private readonly warehouse: WarehouseManagementService) {}

  execute(taskId: string, reason?: string): Promise<UseCaseResult<CancelPickingTaskResult>> {
    return this.warehouse.cancelPickingTask(taskId, reason).then(useCaseResult);
  }
}

export class GetPickingHistoryUseCase {
  constructor(private readonly warehouse: WarehouseManagementService) {}

  execute(taskId: string): Promise<UseCaseResult<PickingHistoryView>> {
    return this.warehouse.getPickingHistory(taskId).then(useCaseResult);
  }
}
