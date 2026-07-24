import type { Benchmark } from "@server/application/ai-benchmark-registry/models/benchmark.model";

export interface IBenchmarkSerializer {
  serialize(benchmark: Benchmark): Promise<string>;
  deserialize(serialized: string): Promise<Benchmark>;
}
