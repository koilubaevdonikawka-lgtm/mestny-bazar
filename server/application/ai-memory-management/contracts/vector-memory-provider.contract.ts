import type { MemoryRecord } from "@server/application/ai-memory-management/models/memory-record.model";

/** Future integration point for vector database memory. Not wired yet. */
export interface IVectorMemoryProvider {
  index(record: MemoryRecord): Promise<void>;
  remove(memoryId: string): Promise<void>;
  search(query: string, limit?: number): Promise<readonly MemoryRecord[]>;
}
