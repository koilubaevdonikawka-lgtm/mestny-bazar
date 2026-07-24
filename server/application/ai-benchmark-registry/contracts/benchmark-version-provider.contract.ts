import type { Benchmark } from "@server/application/ai-benchmark-registry/models/benchmark.model";

/** Future integration point for benchmark version management. Not wired yet. */
export interface IBenchmarkVersionProvider {
  listVersions(benchmarkId: string): Promise<readonly Benchmark[]>;
  getVersion(benchmarkId: string, version: string): Promise<Benchmark | null>;
}
