import type { IBenchmarkRepository } from "@server/application/ai-benchmark-registry/contracts/benchmark-repository.contract";
import type { Benchmark } from "@server/application/ai-benchmark-registry/models/benchmark.model";

/** In-memory benchmark store. */
export class BenchmarkRepository implements IBenchmarkRepository {
  private readonly benchmarks = new Map<string, Benchmark>();
  private readonly benchmarksByName = new Map<string, string>();
  private readonly benchmarksByCategory = new Map<string, Set<string>>();

  async save(benchmark: Benchmark): Promise<void> {
    const existing = this.benchmarks.get(benchmark.benchmarkId);
    if (existing) {
      if (existing.name !== benchmark.name) {
        this.benchmarksByName.delete(existing.name);
      }
      if (existing.category !== benchmark.category) {
        this.removeFromCategory(existing.category, existing.benchmarkId);
      }
    }

    this.benchmarks.set(benchmark.benchmarkId, benchmark);
    this.benchmarksByName.set(benchmark.name, benchmark.benchmarkId);
    this.addToCategory(benchmark.category, benchmark.benchmarkId);
  }

  async findById(benchmarkId: string): Promise<Benchmark | null> {
    return this.benchmarks.get(benchmarkId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Benchmark | null> {
    const benchmarkId = this.benchmarksByName.get(name.trim());
    if (!benchmarkId) {
      return null;
    }
    return this.benchmarks.get(benchmarkId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Benchmark[]> {
    const benchmarkIds = this.benchmarksByCategory.get(category.trim());
    if (!benchmarkIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...benchmarkIds]
        .map((benchmarkId) => this.benchmarks.get(benchmarkId))
        .filter((benchmark): benchmark is Benchmark => benchmark !== undefined),
    );
  }

  async findAll(): Promise<readonly Benchmark[]> {
    return Object.freeze([...this.benchmarks.values()]);
  }

  async delete(benchmarkId: string): Promise<boolean> {
    const benchmark = await this.findById(benchmarkId);
    if (!benchmark) {
      return false;
    }
    this.benchmarks.delete(benchmark.benchmarkId);
    this.benchmarksByName.delete(benchmark.name);
    this.removeFromCategory(benchmark.category, benchmark.benchmarkId);
    return true;
  }

  private addToCategory(category: string, benchmarkId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.benchmarksByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(benchmarkId);
    this.benchmarksByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, benchmarkId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.benchmarksByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(benchmarkId);
    if (categorySet.size === 0) {
      this.benchmarksByCategory.delete(normalizedCategory);
    }
  }
}
