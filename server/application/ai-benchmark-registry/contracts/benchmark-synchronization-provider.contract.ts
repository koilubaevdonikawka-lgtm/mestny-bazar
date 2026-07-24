import type { Benchmark } from "@server/application/ai-benchmark-registry/models/benchmark.model";

/** Future integration point for benchmark synchronization. Not wired yet. */
export interface IBenchmarkSynchronizationProvider {
  synchronize(benchmarks: readonly Benchmark[]): Promise<void>;
}
