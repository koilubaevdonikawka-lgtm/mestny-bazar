import type { IBenchmarkSerializer } from "@server/application/ai-benchmark-registry/contracts/benchmark-serializer.contract";
import {
  createBenchmark,
  type Benchmark,
} from "@server/application/ai-benchmark-registry/models/benchmark.model";

/** JSON-based benchmark serializer. */
export class JsonBenchmarkSerializer implements IBenchmarkSerializer {
  async serialize(benchmark: Benchmark): Promise<string> {
    return JSON.stringify(benchmark);
  }

  async deserialize(serialized: string): Promise<Benchmark> {
    if (!serialized.trim()) {
      throw new Error("Serialized benchmark cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Benchmark>;
    return createBenchmark({
      benchmarkId: parsed.benchmarkId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
