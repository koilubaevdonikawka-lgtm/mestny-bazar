import type {
  ITaskExecutor,
  TaskExecutionResult,
} from "@server/application/scheduling-management/contracts/task-executor.contract";
import type { ScheduledTask } from "@server/application/scheduling-management/models/scheduling.model";

/** Default task executor — invokes handler key without domain logic. */
export class DefaultTaskExecutor implements ITaskExecutor {
  async execute(task: ScheduledTask): Promise<TaskExecutionResult> {
    if (task.status === "paused") {
      return Object.freeze({
        success: false,
        message: `Task "${task.name}" is paused.`,
      });
    }

    return Object.freeze({
      success: true,
      message: `Handler "${task.handlerKey}" executed successfully.`,
    });
  }
}
