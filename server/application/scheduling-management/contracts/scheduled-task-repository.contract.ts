import type { ScheduledTask } from "@server/application/scheduling-management/models/scheduling.model";

export interface IScheduledTaskRepository {
  save(task: ScheduledTask): Promise<void>;
  findById(taskId: string): Promise<ScheduledTask | null>;
  delete(taskId: string): Promise<void>;
  findAll(): Promise<readonly ScheduledTask[]>;
}
