/**
 * Future integration ports for Idempotency Management.
 * Not implemented — reserved for distributed idempotency systems.
 */

import type { IdempotencyRecord } from "@server/application/idempotency-management/models/idempotency.model";

/** Redis Idempotency Storage — distributed key-value idempotency store. */
export interface IRedisIdempotencyStorage {
  setWithTtl(storageKey: string, record: IdempotencyRecord, ttlSeconds: number): Promise<void>;
  get(storageKey: string): Promise<IdempotencyRecord | null>;
  delete(storageKey: string): Promise<void>;
}

/** Distributed Lock Provider — cluster-wide operation locking. */
export interface IDistributedLockProvider {
  acquireLock(lockKey: string, ttlSeconds: number): Promise<string | null>;
  releaseLock(lockKey: string, lockToken: string): Promise<void>;
}

/** Optimistic Concurrency Provider — version-based conflict detection. */
export interface IOptimisticConcurrencyProvider {
  readVersion(storageKey: string): Promise<number>;
  compareAndSwap(storageKey: string, expectedVersion: number, record: IdempotencyRecord): Promise<boolean>;
}

/** Pessimistic Lock Provider — exclusive lock for idempotency keys. */
export interface IPessimisticLockProvider {
  lock(storageKey: string): Promise<void>;
  unlock(storageKey: string): Promise<void>;
  isLocked(storageKey: string): Promise<boolean>;
}

/** Cluster Synchronization — cross-node idempotency coordination. */
export interface IClusterSynchronization {
  broadcastKeyRegistered(storageKey: string): Promise<void>;
  subscribeToKeyEvents(callback: (storageKey: string, event: string) => void): Promise<void>;
}
