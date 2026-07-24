import type { Benchmark } from "@server/application/ai-benchmark-registry/models/benchmark.model";

export interface IBenchmarkRepository {
  save(benchmark: Benchmark): Promise<void>;
  findById(benchmarkId: string): Promise<Benchmark | null>;
  findByName(name: string): Promise<Benchmark | null>;
  findByCategory(category: string): Promise<readonly Benchmark[]>;
  findAll(): Promise<readonly Benchmark[]>;
  delete(benchmarkId: string): Promise<boolean>;
}
