import type { MemoryRecord } from "@server/application/ai-memory-management/models/memory-record.model";

/** Future integration point for long-term memory engine. Not wired yet. */
export interface ILongTermMemoryProvider {
  store(record: MemoryRecord): Promise<void>;
  retrieve(memoryId: string): Promise<MemoryRecord | null>;
  purge(memoryId: string): Promise<void>;
}
