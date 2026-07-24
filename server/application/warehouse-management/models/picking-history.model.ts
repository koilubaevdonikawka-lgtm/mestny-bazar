import type { PickingStatus, PickingTask } from "@server/application/warehouse-management/models/picking-task.model";

export interface PickingHistoryEntry {
  readonly id: string;
  readonly taskId: string;
  readonly status: PickingStatus;
  readonly previousStatus: PickingStatus | null;
  readonly reason: string | null;
  readonly actor: string | null;
  readonly occurredAt: string;
}

export function createPickingHistoryEntry(input: {
  id: string;
  taskId: string;
  status: PickingStatus;
  previousStatus?: PickingStatus | null;
  reason?: string | null;
  actor?: string | null;
  occurredAt?: string;
}): PickingHistoryEntry {
  return Object.freeze({
    id: input.id.trim(),
    taskId: input.taskId.trim(),
    status: input.status,
    previousStatus: input.previousStatus ?? null,
    reason: input.reason?.trim() ?? null,
    actor: input.actor?.trim() ?? null,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  });
}

export interface PickingHistoryView {
  readonly taskId: string;
  readonly entries: readonly PickingHistoryEntry[];
}

export interface CancelPickingTaskResult {
  readonly cancelled: boolean;
}

export interface AssignPickerResult {
  readonly assigned: boolean;
  readonly taskId: string;
  readonly pickerId: string;
  readonly status: PickingStatus;
}

export interface CompletePickingResult {
  readonly completed: boolean;
  readonly taskId: string;
  readonly status: PickingStatus;
}

export interface PickingTasksListResult {
  readonly tasks: readonly PickingTask[];
  readonly total: number;
}
