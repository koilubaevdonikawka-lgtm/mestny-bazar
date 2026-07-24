import type { Benchmark } from "@server/application/ai-benchmark-registry/models/benchmark.model";

/** Future integration point for external benchmark providers. Not wired yet. */
export interface IRemoteBenchmarkProvider {
  fetchRemote(benchmarkId: string): Promise<Benchmark | null>;
  pushRemote(benchmark: Benchmark): Promise<void>;
}
