import type { IMemoryRepository } from "@server/application/ai-memory-management/contracts/memory-repository.contract";
import type { MemoryRecord } from "@server/application/ai-memory-management/models/memory-record.model";

/** In-memory memory record store. */
export class MemoryRepository implements IMemoryRepository {
  private readonly records = new Map<string, MemoryRecord>();
  private readonly recordsByKey = new Map<string, Set<string>>();
  private readonly recordsByCategory = new Map<string, Set<string>>();

  async save(record: MemoryRecord): Promise<void> {
    const existing = this.records.get(record.memoryId);
    if (existing) {
      if (existing.key !== record.key) {
        this.removeFromKey(existing.key, existing.memoryId);
      }
      if (existing.category !== record.category) {
        this.removeFromCategory(existing.category, existing.memoryId);
      }
    }

    this.records.set(record.memoryId, record);
    this.addToKey(record.key, record.memoryId);
    this.addToCategory(record.category, record.memoryId);
  }

  async findById(memoryId: string): Promise<MemoryRecord | null> {
    return this.records.get(memoryId.trim()) ?? null;
  }

  async findByKey(key: string): Promise<readonly MemoryRecord[]> {
    const memoryIds = this.recordsByKey.get(key.trim());
    if (!memoryIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...memoryIds]
        .map((memoryId) => this.records.get(memoryId))
        .filter((record): record is MemoryRecord => record !== undefined),
    );
  }

  async findByCategory(category: string): Promise<readonly MemoryRecord[]> {
    const memoryIds = this.recordsByCategory.get(category.trim());
    if (!memoryIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...memoryIds]
        .map((memoryId) => this.records.get(memoryId))
        .filter((record): record is MemoryRecord => record !== undefined),
    );
  }

  async findAll(): Promise<readonly MemoryRecord[]> {
    return Object.freeze([...this.records.values()]);
  }

  async delete(memoryId: string): Promise<boolean> {
    const record = await this.findById(memoryId);
    if (!record) {
      return false;
    }
    this.records.delete(record.memoryId);
    this.removeFromKey(record.key, record.memoryId);
    this.removeFromCategory(record.category, record.memoryId);
    return true;
  }

  private addToKey(key: string, memoryId: string): void {
    const normalizedKey = key.trim();
    const keySet = this.recordsByKey.get(normalizedKey) ?? new Set<string>();
    keySet.add(memoryId);
    this.recordsByKey.set(normalizedKey, keySet);
  }

  private removeFromKey(key: string, memoryId: string): void {
    const normalizedKey = key.trim();
    const keySet = this.recordsByKey.get(normalizedKey);
    if (!keySet) {
      return;
    }
    keySet.delete(memoryId);
    if (keySet.size === 0) {
      this.recordsByKey.delete(normalizedKey);
    }
  }

  private addToCategory(category: string, memoryId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.recordsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(memoryId);
    this.recordsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, memoryId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.recordsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(memoryId);
    if (categorySet.size === 0) {
      this.recordsByCategory.delete(normalizedCategory);
    }
  }
}
