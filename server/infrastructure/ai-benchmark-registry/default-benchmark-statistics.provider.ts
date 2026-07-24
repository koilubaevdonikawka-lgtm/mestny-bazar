import type { IBenchmarkStatisticsProvider } from "@server/application/ai-benchmark-registry/contracts/benchmark-statistics-provider.contract";
import type { BenchmarkRegistryStatistics } from "@server/application/ai-benchmark-registry/models/benchmark.model";

/** Default in-memory benchmark statistics provider. */
export class DefaultBenchmarkStatisticsProvider implements IBenchmarkStatisticsProvider {
  async getStatistics(input: {
    totalBenchmarks: number;
    activeBenchmarks: number;
    categories: readonly string[];
  }): Promise<BenchmarkRegistryStatistics> {
    return Object.freeze({
      totalBenchmarks: input.totalBenchmarks,
      activeBenchmarks: input.activeBenchmarks,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
