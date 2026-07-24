import type { RateLimitStatistics } from "@server/application/rate-limiting-management/models/rate-limit.model";

export interface IRateLimitStatisticsProvider {
  recordCheck(ruleId: string, allowed: boolean): Promise<void>;
  getStatistics(totalRules: number, counters: readonly {
    ruleId: string;
    counterKey: string;
    count: number;
    maxRequests: number;
  }[]): Promise<RateLimitStatistics>;
}
