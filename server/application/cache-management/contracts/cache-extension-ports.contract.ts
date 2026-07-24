/**
 * Future integration ports for Cache Management.
 * Not implemented — reserved for external cache systems.
 */

import type { CacheEntry } from "@server/application/cache-management/models/cache-entry.model";

/** Redis Cache Provider — Redis integration. */
export interface IRedisCacheProvider {
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

/** Memory Cache Provider — process-local cache integration. */
export interface IMemoryCacheProvider {
  set(entry: CacheEntry): Promise<void>;
  get(key: string): Promise<CacheEntry | null>;
}

/** Hybrid Cache Provider — multi-tier cache integration. */
export interface IHybridCacheProvider {
  get(key: string): Promise<CacheEntry | null>;
  set(entry: CacheEntry): Promise<void>;
  invalidate(key: string): Promise<void>;
}

/** Distributed Cache Provider — cluster-wide cache integration. */
export interface IDistributedCacheProvider {
  syncEntry(entry: CacheEntry): Promise<void>;
  fetchEntry(key: string): Promise<CacheEntry | null>;
}

/** Cache Invalidation Provider — cache invalidation coordination. */
export interface ICacheInvalidationProvider {
  invalidateKey(key: string): Promise<void>;
  invalidateGroup(group: string): Promise<number>;
}
