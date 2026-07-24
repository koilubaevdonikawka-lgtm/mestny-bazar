import type { Benchmark } from "@server/application/ai-benchmark-registry/models/benchmark.model";

/** Future integration point for benchmark import. Not wired yet. */
export interface IBenchmarkImportProvider {
  importFrom(source: string): Promise<readonly Benchmark[]>;
}
