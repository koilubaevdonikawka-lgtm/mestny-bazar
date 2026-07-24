import type { IWarehouseHistoryRepository } from "@server/application/warehouse-management/contracts/warehouse-history-repository.contract";
import type { PickingHistoryEntry } from "@server/application/warehouse-management/models/picking-history.model";

/** In-memory picking history store. */
export class WarehouseHistoryRepository implements IWarehouseHistoryRepository {
  private readonly entriesByTask = new Map<string, PickingHistoryEntry[]>();

  async append(entry: PickingHistoryEntry): Promise<void> {
    const entries = this.entriesByTask.get(entry.taskId) ?? [];
    entries.push(entry);
    this.entriesByTask.set(entry.taskId, entries);
  }

  async findByTaskId(taskId: string): Promise<readonly PickingHistoryEntry[]> {
    const entries = this.entriesByTask.get(taskId.trim()) ?? [];
    return Object.freeze(
      [...entries].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt)),
    );
  }
}
