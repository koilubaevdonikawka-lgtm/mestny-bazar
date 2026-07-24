import type { ISchedulingHistoryRepository } from "@server/application/scheduling-management/contracts/scheduling-history-repository.contract";
import type { ExecutionHistoryEntry } from "@server/application/scheduling-management/models/scheduling.model";

/** In-memory scheduling execution history store. */
export class SchedulingHistoryRepository implements ISchedulingHistoryRepository {
  private readonly entries = new Map<string, ExecutionHistoryEntry>();
  private readonly entriesByTask = new Map<string, Set<string>>();

  async save(entry: ExecutionHistoryEntry): Promise<void> {
    this.entries.set(entry.executionId, entry);

    const taskEntries = this.entriesByTask.get(entry.taskId) ?? new Set<string>();
    taskEntries.add(entry.executionId);
    this.entriesByTask.set(entry.taskId, taskEntries);
  }

  async findByTaskId(taskId: string): Promise<readonly ExecutionHistoryEntry[]> {
    const ids = this.entriesByTask.get(taskId.trim());
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((id) => this.entries.get(id))
        .filter((entry): entry is ExecutionHistoryEntry => entry !== undefined)
        .sort((left, right) => right.startedAt.localeCompare(left.startedAt)),
    );
  }

  async findAll(): Promise<readonly ExecutionHistoryEntry[]> {
    return Object.freeze(
      [...this.entries.values()].sort((left, right) =>
        right.startedAt.localeCompare(left.startedAt),
      ),
    );
  }
}
