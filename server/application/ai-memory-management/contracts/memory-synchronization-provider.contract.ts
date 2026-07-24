import type { MemoryRecord } from "@server/application/ai-memory-management/models/memory-record.model";

/** Future integration point for automatic memory synchronization. Not wired yet. */
export interface IMemorySynchronizationProvider {
  synchronize(records: readonly MemoryRecord[]): Promise<{ synced: number }>;
  getLastSyncAt(): Promise<string | null>;
}
