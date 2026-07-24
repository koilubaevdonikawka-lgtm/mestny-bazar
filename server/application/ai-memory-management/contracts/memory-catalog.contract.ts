import type { MemoryRecord } from "@server/application/ai-memory-management/models/memory-record.model";

export interface IMemoryCatalog {
  register(record: MemoryRecord): Promise<void>;
  remove(memoryId: string): Promise<void>;
  findById(memoryId: string): Promise<MemoryRecord | null>;
  findByKey(key: string): Promise<readonly MemoryRecord[]>;
  findByCategory(category: string): Promise<readonly MemoryRecord[]>;
  listAll(): Promise<readonly MemoryRecord[]>;
}
