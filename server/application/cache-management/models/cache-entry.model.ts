/** Cached entry — generic data only, no domain knowledge. */
export interface CacheEntry {
  readonly key: string;
  readonly group: string;
  readonly serializedValue: string;
  readonly expiresAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SetCacheValueInput {
  readonly key: string;
  readonly value: unknown;
  readonly group?: string;
  readonly ttlSeconds?: number;
}

export interface CacheValueResult {
  readonly key: string;
  readonly value: unknown;
  readonly group: string;
  readonly expiresAt: string | null;
}

export interface CacheKeyExistsResult {
  readonly key: string;
  readonly exists: boolean;
}

export interface DeleteCacheGroupResult {
  readonly group: string;
  readonly removedCount: number;
}

export interface ClearCacheResult {
  readonly removedCount: number;
}

export interface CacheStatistics {
  readonly totalEntries: number;
  readonly totalGroups: number;
  readonly expiredEntries: number;
  readonly hits: number;
  readonly misses: number;
}

export interface ListCacheKeysResult {
  readonly keys: readonly string[];
  readonly total: number;
}

export function createCacheEntry(input: {
  key: string;
  group?: string;
  serializedValue: string;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}): CacheEntry {
  const now = new Date().toISOString();
  return Object.freeze({
    key: input.key.trim(),
    group: (input.group ?? "default").trim() || "default",
    serializedValue: input.serializedValue,
    expiresAt: input.expiresAt ?? null,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}

export function normalizeCacheGroup(group?: string): string {
  return (group ?? "default").trim() || "default";
}
