import type { ICacheRepository } from "@server/application/cache-management/contracts/cache-repository.contract";
import type { CacheEntry } from "@server/application/cache-management/models/cache-entry.model";

/** In-memory cache store. */
export class CacheRepository implements ICacheRepository {
  private readonly entries = new Map<string, CacheEntry>();

  async save(entry: CacheEntry): Promise<void> {
    this.entries.set(entry.key, entry);
  }

  async findByKey(key: string): Promise<CacheEntry | null> {
    return this.entries.get(key.trim()) ?? null;
  }

  async delete(key: string): Promise<boolean> {
    return this.entries.delete(key.trim());
  }

  async deleteByGroup(group: string): Promise<number> {
    const normalizedGroup = group.trim();
    let removedCount = 0;

    for (const [key, entry] of this.entries.entries()) {
      if (entry.group === normalizedGroup) {
        this.entries.delete(key);
        removedCount += 1;
      }
    }

    return removedCount;
  }

  async clear(): Promise<number> {
    const removedCount = this.entries.size;
    this.entries.clear();
    return removedCount;
  }

  async findAllKeys(): Promise<readonly string[]> {
    return Object.freeze([...this.entries.keys()]);
  }

  async exists(key: string): Promise<boolean> {
    return this.entries.has(key.trim());
  }

  async findAll(): Promise<readonly CacheEntry[]> {
    return Object.freeze([...this.entries.values()]);
  }
}
