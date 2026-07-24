import type { IWarehouseStore } from "@server/application/modules/warehouse/warehouse/contracts";
import type {
  AssignWarehouseWorkerDto,
  CompleteWarehouseTaskDto,
  CreateWarehouseTaskDto,
} from "@server/application/modules/warehouse/warehouse/dto";
import {
  createWarehouseTaskAssignedEvent,
  createWarehouseTaskCompletedEvent,
  createWarehouseTaskCreatedEvent,
} from "@server/application/modules/warehouse/warehouse/events";
import {
  createPickingList,
  createWarehouseTask,
  createWarehouseWorker,
  WarehouseTaskStatus,
  withWarehouseTaskCompleted,
  withWarehouseTaskWorker,
  type WarehouseTask,
} from "@server/application/modules/warehouse/warehouse/models";
import type { IIdGenerator } from "@server/application/ports";

/** Warehouse business capability service — orchestrates warehouse tasks via IWarehouseStore. */
export class WarehouseService {
  constructor(
    private readonly store: IWarehouseStore,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createTask(dto: CreateWarehouseTaskDto): Promise<WarehouseTask> {
    validateCreateWarehouseTaskDto(dto);

    const task = createWarehouseTask({
      id: this.idGenerator.generate(),
      orderId: dto.orderId,
      pickingList: createPickingList(
        dto.items.map((item) =>
          Object.freeze({
            productId: item.productId,
            sellerId: item.sellerId,
            name: item.name,
            quantity: item.quantity,
          }),
        ),
      ),
    });

    await this.store.saveTask(task);
    createWarehouseTaskCreatedEvent({
      taskId: task.id,
      orderId: task.orderId,
      status: task.status,
      itemCount: task.pickingList.items.length,
    });

    return task;
  }

  async assignWorker(dto: AssignWarehouseWorkerDto): Promise<WarehouseTask> {
    const task = await this.requireTask(dto.taskId);
    if (task.status === WarehouseTaskStatus.Completed) {
      throw new Error(`Warehouse task ${task.id} is already completed.`);
    }

    const worker = createWarehouseWorker({
      id: dto.workerId,
      name: dto.workerName,
    });
    const updated = withWarehouseTaskWorker(task, worker);
    await this.store.updateTask(updated);
    createWarehouseTaskAssignedEvent({
      taskId: updated.id,
      orderId: updated.orderId,
      workerId: worker.id,
      status: updated.status,
    });

    return updated;
  }

  async getTask(taskId: string): Promise<WarehouseTask | null> {
    return this.store.findById(taskId.trim());
  }

  async completeTask(dto: CompleteWarehouseTaskDto): Promise<WarehouseTask> {
    const task = await this.requireTask(dto.taskId);
    if (task.status === WarehouseTaskStatus.Completed) {
      return task;
    }

    if (task.status !== WarehouseTaskStatus.Assigned) {
      throw new Error(`Warehouse task ${task.id} must be assigned before completion.`);
    }

    const updated = withWarehouseTaskCompleted(task);
    await this.store.updateTask(updated);
    createWarehouseTaskCompletedEvent({
      taskId: updated.id,
      orderId: updated.orderId,
      status: updated.status,
    });

    return updated;
  }

  async getTasksByOrder(orderId: string): Promise<readonly WarehouseTask[]> {
    return this.store.findByOrderId(orderId.trim());
  }

  private async requireTask(taskId: string): Promise<WarehouseTask> {
    const task = await this.store.findById(taskId.trim());
    if (!task) {
      throw new Error(`Warehouse task not found: ${taskId}`);
    }
    return task;
  }
}

function validateCreateWarehouseTaskDto(dto: CreateWarehouseTaskDto): void {
  if (!dto.orderId?.trim()) {
    throw new Error("Order id is required.");
  }
  if (!dto.items.length) {
    throw new Error("At least one picking item is required.");
  }

  for (const item of dto.items) {
    if (!item.productId?.trim()) {
      throw new Error("Product id is required for each picking item.");
    }
    if (!item.sellerId?.trim()) {
      throw new Error("Seller id is required for each picking item.");
    }
    if (!item.name?.trim()) {
      throw new Error("Product name is required for each picking item.");
    }
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new Error("Picking quantity must be greater than zero.");
    }
  }
}
