import type { ExecutionHistoryEntry } from "@server/application/scheduling-management/models/scheduling.model";

export interface ISchedulingHistoryRepository {
  save(entry: ExecutionHistoryEntry): Promise<void>;
  findByTaskId(taskId: string): Promise<readonly ExecutionHistoryEntry[]>;
  findAll(): Promise<readonly ExecutionHistoryEntry[]>;
}
