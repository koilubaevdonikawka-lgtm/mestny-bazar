import type { MemoryRecord } from "@server/application/ai-memory-management/models/memory-record.model";

/** Future integration point for external memory stores. Not wired yet. */
export interface IRemoteMemoryProvider {
  fetchRemote(memoryId: string): Promise<MemoryRecord | null>;
  pushRemote(record: MemoryRecord): Promise<void>;
}
