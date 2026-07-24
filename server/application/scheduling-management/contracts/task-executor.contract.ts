import type { ScheduledTask } from "@server/application/scheduling-management/models/scheduling.model";

export interface TaskExecutionResult {
  readonly success: boolean;
  readonly message: string;
}

export interface ITaskExecutor {
  execute(task: ScheduledTask): Promise<TaskExecutionResult>;
}
