/**
 * Warehouse Management — order picking lifecycle only.
 *
 * Reads orders via IOrderWarehouseReader only.
 * Does NOT access Order Repository, Delivery, Payment, Checkout, Cart, or Product BCM directly.
 */
import type { IOrderWarehouseReader } from "@server/application/warehouse-management/contracts/order-warehouse-reader.contract";
import type { IPickerProvider } from "@server/application/warehouse-management/contracts/picker-provider.contract";
import type { IWarehouseEventPublisher } from "@server/application/warehouse-management/contracts/warehouse-event-publisher.contract";
import type { IWarehouseHistoryRepository } from "@server/application/warehouse-management/contracts/warehouse-history-repository.contract";
import type { IWarehouseRepository } from "@server/application/warehouse-management/contracts/warehouse-repository.contract";
import type { IWarehouseStatusProvider } from "@server/application/warehouse-management/contracts/warehouse-status-provider.contract";
import {
  createPickingHistoryEntry,
  type AssignPickerResult,
  type CancelPickingTaskResult,
  type CompletePickingResult,
  type PickingHistoryView,
  type PickingTasksListResult,
} from "@server/application/warehouse-management/models/picking-history.model";
import {
  createPickingTask,
  PickingStatus,
  type PickingTask,
  withPickerId,
  withPickingStatus,
} from "@server/application/warehouse-management/models/picking-task.model";
import type { IIdGenerator } from "@server/application/ports";

export class WarehouseManagementService {
  constructor(
    private readonly warehouseRepository: IWarehouseRepository,
    private readonly orderReader: IOrderWarehouseReader,
    private readonly pickerProvider: IPickerProvider,
    private readonly statusProvider: IWarehouseStatusProvider,
    private readonly historyRepository: IWarehouseHistoryRepository,
    private readonly eventPublisher: IWarehouseEventPublisher,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createPickingTask(orderId: string): Promise<PickingTask> {
    const order = await this.requirePickableOrder(orderId);

    const existing = await this.warehouseRepository.findByOrderId(orderId);
    const activeTask = existing.find((task) => !this.statusProvider.isTerminal(task.status));
    if (activeTask) {
      throw new Error(`Active picking task already exists for order: ${orderId}`);
    }

    const taskId = this.idGenerator.generate();
    const task = createPickingTask({
      taskId,
      orderId,
      customerId: order.customerId,
    });

    await this.warehouseRepository.save(task);
    await this.recordHistory(taskId, task.status, null, "Picking task created", null);
    await this.eventPublisher.publishPickingTaskCreated(taskId, orderId, order.customerId);

    return task;
  }

  async assignPicker(taskId: string, pickerId: string): Promise<AssignPickerResult> {
    const task = await this.requireTask(taskId);

    if (task.status === PickingStatus.Cancelled || task.status === PickingStatus.Completed) {
      throw new Error(`Cannot assign picker in status: ${task.status}`);
    }

    const available = await this.pickerProvider.isPickerAvailable(pickerId);
    if (!available) {
      throw new Error(`Picker is not available: ${pickerId}`);
    }

    await this.pickerProvider.assignPicker(pickerId, taskId);

    let updated = withPickerId(task, pickerId);
    if (updated.status === PickingStatus.Pending) {
      updated = await this.transitionTask(
        updated,
        PickingStatus.Assigned,
        "Picker assigned",
        pickerId,
      );
    } else {
      await this.warehouseRepository.update(updated);
    }

    await this.eventPublisher.publishPickerAssigned(taskId, pickerId);

    return {
      assigned: true,
      taskId,
      pickerId,
      status: updated.status,
    };
  }

  async updatePickingStatus(
    taskId: string,
    status: PickingStatus,
    actor?: string,
    reason?: string,
  ): Promise<PickingTask> {
    const task = await this.requireTask(taskId);
    return this.transitionTask(task, status, reason ?? "Status updated", actor ?? null);
  }

  async completePicking(taskId: string): Promise<CompletePickingResult> {
    const task = await this.requireTask(taskId);

    if (task.status === PickingStatus.Completed) {
      return { completed: true, taskId, status: task.status };
    }

    if (this.statusProvider.isTerminal(task.status)) {
      throw new Error(`Picking task cannot be completed in status: ${task.status}`);
    }

    const updated = await this.transitionTask(
      task,
      PickingStatus.Completed,
      "Order picked",
      task.pickerId,
    );

    if (updated.pickerId) {
      await this.pickerProvider.releasePicker(updated.pickerId);
    }

    await this.eventPublisher.publishPickingCompleted(taskId, task.orderId);

    return { completed: true, taskId, status: updated.status };
  }

  async getPickingTask(taskId: string): Promise<PickingTask | null> {
    return this.warehouseRepository.findById(taskId);
  }

  async getPickingTasks(): Promise<PickingTasksListResult> {
    const tasks = await this.warehouseRepository.findAll();
    return { tasks, total: tasks.length };
  }

  async cancelPickingTask(taskId: string, reason?: string): Promise<CancelPickingTaskResult> {
    const task = await this.requireTask(taskId);

    if (task.status === PickingStatus.Cancelled) {
      return { cancelled: true };
    }

    if (this.statusProvider.isTerminal(task.status)) {
      throw new Error(`Picking task cannot be cancelled in status: ${task.status}`);
    }

    if (task.pickerId) {
      await this.pickerProvider.releasePicker(task.pickerId);
    }

    await this.transitionTask(
      task,
      PickingStatus.Cancelled,
      reason ?? "Picking task cancelled",
      null,
    );
    await this.eventPublisher.publishPickingCancelled(taskId, task.orderId);

    return { cancelled: true };
  }

  async getPickingHistory(taskId: string): Promise<PickingHistoryView> {
    await this.requireTask(taskId);
    const entries = await this.historyRepository.findByTaskId(taskId);
    return { taskId, entries };
  }

  private async requirePickableOrder(orderId: string) {
    const order = await this.orderReader.getOrderForPicking(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    if (!order.pickable) {
      throw new Error(`Order is not eligible for picking in status: ${order.status}`);
    }
    return order;
  }

  private async requireTask(taskId: string): Promise<PickingTask> {
    const task = await this.warehouseRepository.findById(taskId);
    if (!task) {
      throw new Error(`Picking task not found: ${taskId}`);
    }
    return task;
  }

  private async transitionTask(
    task: PickingTask,
    status: PickingStatus,
    reason: string,
    actor: string | null,
  ): Promise<PickingTask> {
    if (!this.statusProvider.canTransition(task.status, status)) {
      throw new Error(`Invalid picking status transition: ${task.status} -> ${status}`);
    }

    const updated = withPickingStatus(task, status);
    await this.warehouseRepository.update(updated);
    await this.recordHistory(task.taskId, status, task.status, reason, actor);
    await this.eventPublisher.publishStatusChanged(task.taskId, status, task.status);

    return updated;
  }

  private async recordHistory(
    taskId: string,
    status: PickingStatus,
    previousStatus: PickingStatus | null,
    reason: string,
    actor: string | null,
  ): Promise<void> {
    await this.historyRepository.append(
      createPickingHistoryEntry({
        id: this.idGenerator.generate(),
        taskId,
        status,
        previousStatus,
        reason,
        actor,
      }),
    );
  }
}

export { isPickingStatus } from "@server/application/warehouse-management/models/picking-task.model";
