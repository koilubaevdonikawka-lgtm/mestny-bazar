import type { MemoryRecord } from "@server/application/ai-memory-management/models/memory-record.model";

/** Future integration point for short-term memory store. Not wired yet. */
export interface IShortTermMemoryProvider {
  put(record: MemoryRecord, ttlSeconds?: number): Promise<void>;
  get(key: string): Promise<readonly MemoryRecord[]>;
  evict(key: string): Promise<void>;
}
