/**
 * Cache Management — cache storage and retrieval only.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ICacheExpirationPolicy } from "@server/application/cache-management/contracts/cache-expiration-policy.contract";
import type { ICacheKeyGenerator } from "@server/application/cache-management/contracts/cache-key-generator.contract";
import type { ICacheRepository } from "@server/application/cache-management/contracts/cache-repository.contract";
import type { ICacheSerializer } from "@server/application/cache-management/contracts/cache-serializer.contract";
import type { ICacheStatisticsProvider } from "@server/application/cache-management/contracts/cache-statistics-provider.contract";
import {
  createCacheEntry,
  normalizeCacheGroup,
  type CacheKeyExistsResult,
  type CacheStatistics,
  type CacheValueResult,
  type ClearCacheResult,
  type DeleteCacheGroupResult,
  type ListCacheKeysResult,
  type SetCacheValueInput,
} from "@server/application/cache-management/models/cache-entry.model";

export class CacheManagementService {
  constructor(
    private readonly cacheRepository: ICacheRepository,
    private readonly cacheSerializer: ICacheSerializer,
    private readonly expirationPolicy: ICacheExpirationPolicy,
    private readonly statisticsProvider: ICacheStatisticsProvider,
    private readonly keyGenerator: ICacheKeyGenerator,
  ) {}

  async setCacheValue(input: SetCacheValueInput): Promise<CacheValueResult> {
    const key = this.resolveKey(input.key, input.group);
    const group = normalizeCacheGroup(input.group);
    const existing = await this.cacheRepository.findByKey(key);

    const entry = createCacheEntry({
      key,
      group,
      serializedValue: this.cacheSerializer.serialize(input.value),
      expiresAt: this.expirationPolicy.calculateExpiresAt(input.ttlSeconds),
      createdAt: existing?.createdAt,
    });

    await this.cacheRepository.save(entry);

    return Object.freeze({
      key,
      value: input.value,
      group,
      expiresAt: entry.expiresAt,
    });
  }

  async getCacheValue(key: string): Promise<CacheValueResult | null> {
    const normalizedKey = key.trim();
    const entry = await this.cacheRepository.findByKey(normalizedKey);
    if (!entry) {
      await this.statisticsProvider.recordMiss();
      return null;
    }

    if (this.expirationPolicy.isExpired(entry.expiresAt)) {
      await this.cacheRepository.delete(normalizedKey);
      await this.statisticsProvider.recordMiss();
      return null;
    }

    await this.statisticsProvider.recordHit();

    return Object.freeze({
      key: entry.key,
      value: this.cacheSerializer.deserialize(entry.serializedValue),
      group: entry.group,
      expiresAt: entry.expiresAt,
    });
  }

  async cacheKeyExists(key: string): Promise<CacheKeyExistsResult> {
    const normalizedKey = key.trim();
    const entry = await this.cacheRepository.findByKey(normalizedKey);
    const exists =
      entry !== null && !this.expirationPolicy.isExpired(entry.expiresAt);

    if (entry && this.expirationPolicy.isExpired(entry.expiresAt)) {
      await this.cacheRepository.delete(normalizedKey);
    }

    return Object.freeze({ key: normalizedKey, exists });
  }

  async deleteCacheValue(key: string): Promise<{ key: string; deleted: boolean }> {
    const normalizedKey = key.trim();
    const deleted = await this.cacheRepository.delete(normalizedKey);
    return Object.freeze({ key: normalizedKey, deleted });
  }

  async deleteCacheGroup(group: string): Promise<DeleteCacheGroupResult> {
    const normalizedGroup = normalizeCacheGroup(group);
    const removedCount = await this.cacheRepository.deleteByGroup(normalizedGroup);
    return Object.freeze({ group: normalizedGroup, removedCount });
  }

  async clearCache(): Promise<ClearCacheResult> {
    const removedCount = await this.cacheRepository.clear();
    return Object.freeze({ removedCount });
  }

  async getCacheStatistics(): Promise<CacheStatistics> {
    const entries = await this.cacheRepository.findAll();
    const groups = new Set(entries.map((entry) => entry.group));
    const expiredEntries = entries.filter((entry) =>
      this.expirationPolicy.isExpired(entry.expiresAt),
    ).length;

    return this.statisticsProvider.getStatistics({
      totalEntries: entries.length,
      totalGroups: groups.size,
      expiredEntries,
    });
  }

  async listCacheKeys(): Promise<ListCacheKeysResult> {
    const keys = Object.freeze(
      [...(await this.cacheRepository.findAllKeys())].sort((left, right) =>
        left.localeCompare(right),
      ),
    );

    return Object.freeze({
      keys,
      total: keys.length,
    });
  }

  private resolveKey(key: string, group?: string): string {
    const normalizedKey = key.trim();
    if (!normalizedKey) {
      throw new Error("Cache key is required.");
    }
    return this.keyGenerator.generate(normalizeCacheGroup(group), normalizedKey);
  }
}
