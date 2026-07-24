import type { ICacheStatisticsProvider } from "@server/application/cache-management/contracts/cache-statistics-provider.contract";
import type { CacheStatistics } from "@server/application/cache-management/models/cache-entry.model";

/** Default in-memory cache statistics provider. */
export class DefaultCacheStatisticsProvider implements ICacheStatisticsProvider {
  private hits = 0;
  private misses = 0;

  async recordHit(): Promise<void> {
    this.hits += 1;
  }

  async recordMiss(): Promise<void> {
    this.misses += 1;
  }

  async getStatistics(input: {
    totalEntries: number;
    totalGroups: number;
    expiredEntries: number;
  }): Promise<CacheStatistics> {
    return Object.freeze({
      totalEntries: input.totalEntries,
      totalGroups: input.totalGroups,
      expiredEntries: input.expiredEntries,
      hits: this.hits,
      misses: this.misses,
    });
  }
}
