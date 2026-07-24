import type { CacheStatistics } from "@server/application/cache-management/models/cache-entry.model";

export interface ICacheStatisticsProvider {
  recordHit(): Promise<void>;
  recordMiss(): Promise<void>;
  getStatistics(input: {
    totalEntries: number;
    totalGroups: number;
    expiredEntries: number;
  }): Promise<CacheStatistics>;
}
