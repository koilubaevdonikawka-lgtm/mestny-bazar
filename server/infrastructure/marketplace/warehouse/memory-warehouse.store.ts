import type { IWarehouseStore } from "@server/application/modules/warehouse/warehouse/contracts";
import type { WarehouseTask } from "@server/application/modules/warehouse/warehouse/models";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory warehouse store for development and tests. */
export class MemoryWarehouseStore implements IWarehouseStore {
  private readonly tasks = new InMemoryStore<WarehouseTask>((task) => task.id);
  private readonly byOrder = new Map<string, Set<string>>();

  async saveTask(task: WarehouseTask): Promise<void> {
    this.tasks.set(task);
    const bucket = this.byOrder.get(task.orderId) ?? new Set<string>();
    bucket.add(task.id);
    this.byOrder.set(task.orderId, bucket);
  }

  async updateTask(task: WarehouseTask): Promise<void> {
    if (!this.tasks.has(task.id)) {
      throw new Error(`Warehouse task not found: ${task.id}`);
    }
    this.tasks.set(task);
  }

  async findById(taskId: string): Promise<WarehouseTask | null> {
    return this.tasks.get(taskId) ?? null;
  }

  async findByOrderId(orderId: string): Promise<readonly WarehouseTask[]> {
    const ids = this.byOrder.get(orderId);
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((taskId) => this.tasks.get(taskId))
        .filter((task): task is WarehouseTask => task !== undefined)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
  }
}
