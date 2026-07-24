import type { Benchmark } from "@server/application/ai-benchmark-registry/models/benchmark.model";

export interface IBenchmarkCatalog {
  register(benchmark: Benchmark): Promise<void>;
  remove(benchmarkId: string): Promise<void>;
  findById(benchmarkId: string): Promise<Benchmark | null>;
  findByName(name: string): Promise<Benchmark | null>;
  findByCategory(category: string): Promise<readonly Benchmark[]>;
  listAll(): Promise<readonly Benchmark[]>;
}
