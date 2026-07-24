/** Scheduled task record — scheduling metadata only, no domain logic. */
export interface ScheduledTask {
  readonly taskId: string;
  readonly name: string;
  readonly handlerKey: string;
  readonly schedule: string;
  readonly status: "active" | "paused";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastRunAt: string | null;
  readonly nextRunAt: string | null;
}

export interface ExecutionHistoryEntry {
  readonly executionId: string;
  readonly taskId: string;
  readonly handlerKey: string;
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly status: "running" | "succeeded" | "failed";
  readonly message: string | null;
}

export interface RegisterScheduledTaskInput {
  readonly name: string;
  readonly handlerKey: string;
  readonly schedule: string;
}

export interface RunScheduledTaskResult {
  readonly taskId: string;
  readonly executionId: string;
  readonly status: "succeeded" | "failed";
  readonly message: string;
}

export interface ScheduledTaskActionResult {
  readonly taskId: string;
  readonly status: ScheduledTask["status"];
}

export interface ExecutionHistoryResult {
  readonly entries: readonly ExecutionHistoryEntry[];
  readonly total: number;
}

export interface ListScheduledTasksResult {
  readonly tasks: readonly ScheduledTask[];
  readonly total: number;
}

export function createScheduledTask(input: {
  taskId: string;
  name: string;
  handlerKey: string;
  schedule: string;
  status?: ScheduledTask["status"];
  createdAt?: string;
  updatedAt?: string;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
}): ScheduledTask {
  const now = new Date().toISOString();
  return Object.freeze({
    taskId: input.taskId.trim(),
    name: input.name.trim(),
    handlerKey: input.handlerKey.trim(),
    schedule: input.schedule.trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    lastRunAt: input.lastRunAt ?? null,
    nextRunAt: input.nextRunAt ?? null,
  });
}

export function createExecutionHistoryEntry(input: {
  executionId: string;
  taskId: string;
  handlerKey: string;
  startedAt?: string;
  completedAt?: string | null;
  status: ExecutionHistoryEntry["status"];
  message?: string | null;
}): ExecutionHistoryEntry {
  return Object.freeze({
    executionId: input.executionId.trim(),
    taskId: input.taskId.trim(),
    handlerKey: input.handlerKey.trim(),
    startedAt: input.startedAt ?? new Date().toISOString(),
    completedAt: input.completedAt ?? null,
    status: input.status,
    message: input.message ?? null,
  });
}
