import type { MemoryRecord } from "@server/application/ai-memory-management/models/memory-record.model";

export interface IMemoryRepository {
  save(record: MemoryRecord): Promise<void>;
  findById(memoryId: string): Promise<MemoryRecord | null>;
  findByKey(key: string): Promise<readonly MemoryRecord[]>;
  findByCategory(category: string): Promise<readonly MemoryRecord[]>;
  findAll(): Promise<readonly MemoryRecord[]>;
  delete(memoryId: string): Promise<boolean>;
}
