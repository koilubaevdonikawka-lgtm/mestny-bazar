import type { ISchedulerEngine } from "@server/application/scheduling-management/contracts/scheduler-engine.contract";
import type { ScheduledTask } from "@server/application/scheduling-management/models/scheduling.model";

interface EngineState {
  readonly task: ScheduledTask;
  paused: boolean;
}

/** In-memory scheduler engine — no external cron runtime. */
export class InMemorySchedulerEngine implements ISchedulerEngine {
  private readonly tasks = new Map<string, EngineState>();

  async registerTask(task: ScheduledTask): Promise<void> {
    this.tasks.set(task.taskId, { task, paused: task.status === "paused" });
  }

  async unregisterTask(taskId: string): Promise<void> {
    this.tasks.delete(taskId.trim());
  }

  async pauseTask(taskId: string): Promise<void> {
    const state = this.tasks.get(taskId.trim());
    if (state) {
      state.paused = true;
    }
  }

  async resumeTask(taskId: string): Promise<void> {
    const state = this.tasks.get(taskId.trim());
    if (state) {
      state.paused = false;
    }
  }

  async isRegistered(taskId: string): Promise<boolean> {
    return this.tasks.has(taskId.trim());
  }
}
