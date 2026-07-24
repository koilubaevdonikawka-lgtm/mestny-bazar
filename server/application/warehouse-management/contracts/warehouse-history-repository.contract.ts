import type { PickingHistoryEntry } from "@server/application/warehouse-management/models/picking-history.model";

export interface IWarehouseHistoryRepository {
  append(entry: PickingHistoryEntry): Promise<void>;
  findByTaskId(taskId: string): Promise<readonly PickingHistoryEntry[]>;
}
