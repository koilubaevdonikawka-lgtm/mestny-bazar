import type { WarehouseManagementApplicationService } from "@server/application/warehouse-management/services/warehouse-management-application.service";
import type {
  CreatePickingWorkflowResult,
  IWarehouseWorkflowService,
  WarehouseWorkflowSnapshot,
} from "@server/application/workflow-orchestration/contracts/warehouse-workflow-service.contract";

/** Adapts Warehouse Management Application Service to IWarehouseWorkflowService. */
export class WarehouseWorkflowServiceAdapter implements IWarehouseWorkflowService {
  constructor(private readonly warehouse: WarehouseManagementApplicationService) {}

  async createPickingTask(orderId: string): Promise<CreatePickingWorkflowResult> {
    const result = await this.warehouse.createPickingTask(orderId);
    const task = result.value;
    return Object.freeze({
      taskId: task.taskId,
      orderId: task.orderId,
      status: task.status,
    });
  }

  async completePicking(taskId: string): Promise<boolean> {
    const result = await this.warehouse.completePicking(taskId);
    return result.value.completed;
  }

  async cancelPickingTask(taskId: string, reason?: string): Promise<boolean> {
    const result = await this.warehouse.cancelPickingTask(taskId, reason);
    return result.value.cancelled;
  }

  async getPickingTask(taskId: string): Promise<WarehouseWorkflowSnapshot | null> {
    const result = await this.warehouse.getPickingTask(taskId);
    const task = result.value;
    if (!task) {
      return null;
    }

    return Object.freeze({
      taskId: task.taskId,
      orderId: task.orderId,
      status: task.status,
    });
  }

  async findTaskByOrderId(orderId: string): Promise<WarehouseWorkflowSnapshot | null> {
    const result = await this.warehouse.getPickingTasks();
    const task = result.value.tasks.find((entry) => entry.orderId === orderId);
    if (!task) {
      return null;
    }

    return Object.freeze({
      taskId: task.taskId,
      orderId: task.orderId,
      status: task.status,
    });
  }
}
