import type { Benchmark } from "@server/application/ai-benchmark-registry/models/benchmark.model";

/** Future integration point for benchmark export. Not wired yet. */
export interface IBenchmarkExportProvider {
  exportTo(benchmarks: readonly Benchmark[]): Promise<string>;
}
