import type { ScheduledTask } from "@server/application/scheduling-management/models/scheduling.model";

export interface ISchedulerEngine {
  registerTask(task: ScheduledTask): Promise<void>;
  unregisterTask(taskId: string): Promise<void>;
  pauseTask(taskId: string): Promise<void>;
  resumeTask(taskId: string): Promise<void>;
  isRegistered(taskId: string): Promise<boolean>;
}
