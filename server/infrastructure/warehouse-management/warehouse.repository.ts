import type { IWarehouseRepository } from "@server/application/warehouse-management/contracts/warehouse-repository.contract";
import type { PickingTask } from "@server/application/warehouse-management/models/picking-task.model";

/** In-memory picking task store. */
export class WarehouseRepository implements IWarehouseRepository {
  private readonly tasks = new Map<string, PickingTask>();
  private readonly tasksByOrder = new Map<string, Set<string>>();

  async save(task: PickingTask): Promise<void> {
    this.tasks.set(task.taskId, task);

    const orderTasks = this.tasksByOrder.get(task.orderId) ?? new Set();
    orderTasks.add(task.taskId);
    this.tasksByOrder.set(task.orderId, orderTasks);
  }

  async findById(taskId: string): Promise<PickingTask | null> {
    return this.tasks.get(taskId.trim()) ?? null;
  }

  async findByOrderId(orderId: string): Promise<readonly PickingTask[]> {
    const ids = this.tasksByOrder.get(orderId.trim());
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((id) => this.tasks.get(id))
        .filter((task): task is PickingTask => task !== undefined)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
  }

  async findAll(): Promise<readonly PickingTask[]> {
    return Object.freeze(
      [...this.tasks.values()].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    );
  }

  async update(task: PickingTask): Promise<void> {
    if (!(await this.findById(task.taskId))) {
      throw new Error(`Picking task not found: ${task.taskId}`);
    }
    this.tasks.set(task.taskId, task);
  }
}
