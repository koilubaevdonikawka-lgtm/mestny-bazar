import type { IScheduledTaskRepository } from "@server/application/scheduling-management/contracts/scheduled-task-repository.contract";
import type { ScheduledTask } from "@server/application/scheduling-management/models/scheduling.model";

/** In-memory scheduled task store. */
export class ScheduledTaskRepository implements IScheduledTaskRepository {
  private readonly tasks = new Map<string, ScheduledTask>();

  async save(task: ScheduledTask): Promise<void> {
    this.tasks.set(task.taskId, task);
  }

  async findById(taskId: string): Promise<ScheduledTask | null> {
    return this.tasks.get(taskId.trim()) ?? null;
  }

  async delete(taskId: string): Promise<void> {
    this.tasks.delete(taskId.trim());
  }

  async findAll(): Promise<readonly ScheduledTask[]> {
    return Object.freeze([...this.tasks.values()]);
  }
}
