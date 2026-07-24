import type { CacheEntry } from "@server/application/cache-management/models/cache-entry.model";

export interface ICacheRepository {
  save(entry: CacheEntry): Promise<void>;
  findByKey(key: string): Promise<CacheEntry | null>;
  delete(key: string): Promise<boolean>;
  deleteByGroup(group: string): Promise<number>;
  clear(): Promise<number>;
  findAllKeys(): Promise<readonly string[]>;
  exists(key: string): Promise<boolean>;
  findAll(): Promise<readonly CacheEntry[]>;
}
