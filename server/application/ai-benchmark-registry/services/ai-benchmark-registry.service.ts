/**
 * AI Benchmark Registry — unified registry for AI benchmarks.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IBenchmarkCatalog } from "@server/application/ai-benchmark-registry/contracts/benchmark-catalog.contract";
import type { IBenchmarkRepository } from "@server/application/ai-benchmark-registry/contracts/benchmark-repository.contract";
import type { IBenchmarkSerializer } from "@server/application/ai-benchmark-registry/contracts/benchmark-serializer.contract";
import type { IBenchmarkStatisticsProvider } from "@server/application/ai-benchmark-registry/contracts/benchmark-statistics-provider.contract";
import type { IBenchmarkValidator } from "@server/application/ai-benchmark-registry/contracts/benchmark-validator.contract";
import {
  createBenchmark,
  type DeleteBenchmarkResult,
  type FindBenchmarkByNameResult,
  type ListBenchmarksByCategoryResult,
  type ListBenchmarksResult,
  type RegisterBenchmarkInput,
  type Benchmark,
  type BenchmarkRegistryStatistics,
  type UpdateBenchmarkInput,
} from "@server/application/ai-benchmark-registry/models/benchmark.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiBenchmarkRegistryService {
  constructor(
    private readonly benchmarkRepository: IBenchmarkRepository,
    private readonly benchmarkCatalog: IBenchmarkCatalog,
    private readonly benchmarkValidator: IBenchmarkValidator,
    private readonly benchmarkSerializer: IBenchmarkSerializer,
    private readonly statisticsProvider: IBenchmarkStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerBenchmark(input: RegisterBenchmarkInput): Promise<Benchmark> {
    const validation = await this.benchmarkValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.benchmarkRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Benchmark already exists with name: ${input.name.trim()}`);
    }

    const benchmark = createBenchmark({
      benchmarkId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.benchmarkRepository.save(benchmark);
    await this.benchmarkCatalog.register(benchmark);
    return benchmark;
  }

  async getBenchmark(benchmarkId: string): Promise<Benchmark | null> {
    return this.benchmarkRepository.findById(benchmarkId.trim());
  }

  async listBenchmarks(): Promise<ListBenchmarksResult> {
    const benchmarks = Object.freeze(
      [...(await this.benchmarkRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ benchmarks, total: benchmarks.length });
  }

  async updateBenchmark(input: UpdateBenchmarkInput): Promise<Benchmark> {
    const benchmarkId = input.benchmarkId.trim();
    const existing = await this.benchmarkRepository.findById(benchmarkId);
    if (!existing) {
      throw new Error(`Benchmark not found: ${benchmarkId}`);
    }

    const validation = await this.benchmarkValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.benchmarkRepository.findByName(input.name.trim());
      if (duplicate && duplicate.benchmarkId !== existing.benchmarkId) {
        throw new Error(`Benchmark already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createBenchmark({
      benchmarkId: existing.benchmarkId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.benchmarkRepository.save(updated);
    await this.benchmarkCatalog.register(updated);
    return updated;
  }

  async deleteBenchmark(benchmarkId: string): Promise<DeleteBenchmarkResult> {
    const normalizedBenchmarkId = benchmarkId.trim();
    const deleted = await this.benchmarkRepository.delete(normalizedBenchmarkId);
    if (deleted) {
      await this.benchmarkCatalog.remove(normalizedBenchmarkId);
    }
    return Object.freeze({ benchmarkId: normalizedBenchmarkId, deleted });
  }

  async findBenchmarkByName(name: string): Promise<FindBenchmarkByNameResult> {
    const normalizedName = name.trim();
    const benchmark = await this.benchmarkRepository.findByName(normalizedName);
    return Object.freeze({ benchmark });
  }

  async listBenchmarksByCategory(category: string): Promise<ListBenchmarksByCategoryResult> {
    const normalizedCategory = category.trim();
    const benchmarks = Object.freeze(
      [...(await this.benchmarkRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      benchmarks,
      total: benchmarks.length,
      category: normalizedCategory,
    });
  }

  async getBenchmarkRegistryStatistics(): Promise<BenchmarkRegistryStatistics> {
    const benchmarks = await this.benchmarkRepository.findAll();
    const activeBenchmarks = benchmarks.filter(
      (benchmark) => benchmark.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(benchmarks.map((benchmark) => benchmark.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalBenchmarks: benchmarks.length,
      activeBenchmarks,
      categories,
    });
  }

  async serializeBenchmark(benchmark: Benchmark): Promise<string> {
    return this.benchmarkSerializer.serialize(benchmark);
  }

  async deserializeBenchmark(serialized: string): Promise<Benchmark> {
    return this.benchmarkSerializer.deserialize(serialized);
  }
}
