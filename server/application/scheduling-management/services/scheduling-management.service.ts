/**
 * Scheduling Management — scheduled task registration and execution only.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IScheduleParser } from "@server/application/scheduling-management/contracts/schedule-parser.contract";
import type { IScheduledTaskRepository } from "@server/application/scheduling-management/contracts/scheduled-task-repository.contract";
import type { ISchedulerEngine } from "@server/application/scheduling-management/contracts/scheduler-engine.contract";
import type { ISchedulingHistoryRepository } from "@server/application/scheduling-management/contracts/scheduling-history-repository.contract";
import type { ITaskExecutor } from "@server/application/scheduling-management/contracts/task-executor.contract";
import {
  createExecutionHistoryEntry,
  createScheduledTask,
  type ExecutionHistoryResult,
  type ListScheduledTasksResult,
  type RegisterScheduledTaskInput,
  type RunScheduledTaskResult,
  type ScheduledTask,
  type ScheduledTaskActionResult,
} from "@server/application/scheduling-management/models/scheduling.model";
import type { IIdGenerator } from "@server/application/ports";

export class SchedulingManagementService {
  constructor(
    private readonly taskRepository: IScheduledTaskRepository,
    private readonly schedulerEngine: ISchedulerEngine,
    private readonly taskExecutor: ITaskExecutor,
    private readonly scheduleParser: IScheduleParser,
    private readonly historyRepository: ISchedulingHistoryRepository,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerTask(input: RegisterScheduledTaskInput): Promise<ScheduledTask> {
    const validation = this.scheduleParser.validate(input.schedule);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const task = createScheduledTask({
      taskId: this.idGenerator.generate(),
      name: input.name,
      handlerKey: input.handlerKey,
      schedule: input.schedule,
      nextRunAt: this.scheduleParser.computeNextRun(input.schedule),
    });

    await this.taskRepository.save(task);
    await this.schedulerEngine.registerTask(task);
    return task;
  }

  async deleteTask(taskId: string): Promise<{ taskId: string; deleted: boolean }> {
    const normalizedTaskId = taskId.trim();
    const task = await this.taskRepository.findById(normalizedTaskId);
    if (!task) {
      throw new Error(`Scheduled task not found: ${normalizedTaskId}`);
    }

    await this.schedulerEngine.unregisterTask(normalizedTaskId);
    await this.taskRepository.delete(normalizedTaskId);

    return Object.freeze({ taskId: normalizedTaskId, deleted: true });
  }

  async getTask(taskId: string): Promise<ScheduledTask | null> {
    return this.taskRepository.findById(taskId.trim());
  }

  async listTasks(): Promise<ListScheduledTasksResult> {
    const tasks = await this.taskRepository.findAll();
    return Object.freeze({
      tasks: Object.freeze(
        [...tasks].sort((left, right) => left.name.localeCompare(right.name)),
      ),
      total: tasks.length,
    });
  }

  async runTask(taskId: string): Promise<RunScheduledTaskResult> {
    const task = await this.requireTask(taskId);
    const executionId = this.idGenerator.generate();
    const startedAt = new Date().toISOString();

    await this.historyRepository.save(
      createExecutionHistoryEntry({
        executionId,
        taskId: task.taskId,
        handlerKey: task.handlerKey,
        startedAt,
        status: "running",
      }),
    );

    const result = await this.taskExecutor.execute(task);
    const completedAt = new Date().toISOString();

    await this.historyRepository.save(
      createExecutionHistoryEntry({
        executionId,
        taskId: task.taskId,
        handlerKey: task.handlerKey,
        startedAt,
        completedAt,
        status: result.success ? "succeeded" : "failed",
        message: result.message,
      }),
    );

    const updatedTask = createScheduledTask({
      ...task,
      lastRunAt: completedAt,
      nextRunAt: this.scheduleParser.computeNextRun(task.schedule),
      updatedAt: completedAt,
    });
    await this.taskRepository.save(updatedTask);

    return Object.freeze({
      taskId: task.taskId,
      executionId,
      status: result.success ? "succeeded" : "failed",
      message: result.message,
    });
  }

  async pauseTask(taskId: string): Promise<ScheduledTaskActionResult> {
    const task = await this.requireTask(taskId);
    await this.schedulerEngine.pauseTask(task.taskId);

    const updatedTask = createScheduledTask({
      ...task,
      status: "paused",
      updatedAt: new Date().toISOString(),
    });
    await this.taskRepository.save(updatedTask);

    return Object.freeze({ taskId: task.taskId, status: "paused" });
  }

  async resumeTask(taskId: string): Promise<ScheduledTaskActionResult> {
    const task = await this.requireTask(taskId);
    await this.schedulerEngine.resumeTask(task.taskId);

    const updatedTask = createScheduledTask({
      ...task,
      status: "active",
      nextRunAt: this.scheduleParser.computeNextRun(task.schedule),
      updatedAt: new Date().toISOString(),
    });
    await this.taskRepository.save(updatedTask);

    return Object.freeze({ taskId: task.taskId, status: "active" });
  }

  async getExecutionHistory(taskId?: string): Promise<ExecutionHistoryResult> {
    const entries = taskId?.trim()
      ? await this.historyRepository.findByTaskId(taskId.trim())
      : await this.historyRepository.findAll();

    const sorted = Object.freeze(
      [...entries].sort((left, right) => right.startedAt.localeCompare(left.startedAt)),
    );

    return Object.freeze({
      entries: sorted,
      total: sorted.length,
    });
  }

  private async requireTask(taskId: string): Promise<ScheduledTask> {
    const task = await this.taskRepository.findById(taskId.trim());
    if (!task) {
      throw new Error(`Scheduled task not found: ${taskId}`);
    }
    return task;
  }
}
