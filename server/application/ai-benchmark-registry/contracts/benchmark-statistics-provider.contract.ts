import type { BenchmarkRegistryStatistics } from "@server/application/ai-benchmark-registry/models/benchmark.model";

export interface IBenchmarkStatisticsProvider {
  getStatistics(input: {
    totalBenchmarks: number;
    activeBenchmarks: number;
    categories: readonly string[];
  }): Promise<BenchmarkRegistryStatistics>;
}
