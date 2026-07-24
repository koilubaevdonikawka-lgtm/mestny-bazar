import type { IRateLimitStatisticsProvider } from "@server/application/rate-limiting-management/contracts/rate-limit-statistics-provider.contract";
import type { RateLimitStatistics } from "@server/application/rate-limiting-management/models/rate-limit.model";

/** Default in-memory rate limit statistics provider. */
export class DefaultRateLimitStatisticsProvider implements IRateLimitStatisticsProvider {
  private totalChecks = 0;
  private totalAllowed = 0;
  private totalDenied = 0;

  async recordCheck(_ruleId: string, allowed: boolean): Promise<void> {
    this.totalChecks += 1;
    if (allowed) {
      this.totalAllowed += 1;
    } else {
      this.totalDenied += 1;
    }
  }

  async getStatistics(
    totalRules: number,
    counters: readonly {
      ruleId: string;
      counterKey: string;
      count: number;
      maxRequests: number;
    }[],
  ): Promise<RateLimitStatistics> {
    return Object.freeze({
      totalRules,
      totalChecks: this.totalChecks,
      totalAllowed: this.totalAllowed,
      totalDenied: this.totalDenied,
      counters: Object.freeze([...counters]),
    });
  }
}
