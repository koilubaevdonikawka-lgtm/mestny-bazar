/** Registered AI benchmark — generic benchmark metadata only, no domain knowledge. */
export interface Benchmark {
  readonly benchmarkId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterBenchmarkInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateBenchmarkInput {
  readonly benchmarkId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListBenchmarksResult {
  readonly benchmarks: readonly Benchmark[];
  readonly total: number;
}

export interface FindBenchmarkByNameResult {
  readonly benchmark: Benchmark | null;
}

export interface ListBenchmarksByCategoryResult {
  readonly benchmarks: readonly Benchmark[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteBenchmarkResult {
  readonly benchmarkId: string;
  readonly deleted: boolean;
}

export interface BenchmarkRegistryStatistics {
  readonly totalBenchmarks: number;
  readonly activeBenchmarks: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createBenchmark(input: {
  benchmarkId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Benchmark {
  const now = new Date().toISOString();
  return Object.freeze({
    benchmarkId: input.benchmarkId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
