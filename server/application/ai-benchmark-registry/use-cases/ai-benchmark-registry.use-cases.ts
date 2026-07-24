import type {
  DeleteBenchmarkResult,
  FindBenchmarkByNameResult,
  ListBenchmarksByCategoryResult,
  ListBenchmarksResult,
  RegisterBenchmarkInput,
  Benchmark,
  BenchmarkRegistryStatistics,
  UpdateBenchmarkInput,
} from "@server/application/ai-benchmark-registry/models/benchmark.model";
import type { AiBenchmarkRegistryService } from "@server/application/ai-benchmark-registry/services/ai-benchmark-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterBenchmarkUseCase {
  constructor(private readonly benchmarkRegistry: AiBenchmarkRegistryService) {}

  execute(input: RegisterBenchmarkInput): Promise<UseCaseResult<Benchmark>> {
    return this.benchmarkRegistry.registerBenchmark(input).then(useCaseResult);
  }
}

export class GetBenchmarkUseCase {
  constructor(private readonly benchmarkRegistry: AiBenchmarkRegistryService) {}

  execute(benchmarkId: string): Promise<UseCaseResult<Benchmark | null>> {
    return this.benchmarkRegistry.getBenchmark(benchmarkId).then(useCaseResult);
  }
}

export class ListBenchmarksUseCase {
  constructor(private readonly benchmarkRegistry: AiBenchmarkRegistryService) {}

  execute(): Promise<UseCaseResult<ListBenchmarksResult>> {
    return this.benchmarkRegistry.listBenchmarks().then(useCaseResult);
  }
}

export class UpdateBenchmarkUseCase {
  constructor(private readonly benchmarkRegistry: AiBenchmarkRegistryService) {}

  execute(input: UpdateBenchmarkInput): Promise<UseCaseResult<Benchmark>> {
    return this.benchmarkRegistry.updateBenchmark(input).then(useCaseResult);
  }
}

export class DeleteBenchmarkUseCase {
  constructor(private readonly benchmarkRegistry: AiBenchmarkRegistryService) {}

  execute(benchmarkId: string): Promise<UseCaseResult<DeleteBenchmarkResult>> {
    return this.benchmarkRegistry.deleteBenchmark(benchmarkId).then(useCaseResult);
  }
}

export class FindBenchmarkByNameUseCase {
  constructor(private readonly benchmarkRegistry: AiBenchmarkRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindBenchmarkByNameResult>> {
    return this.benchmarkRegistry.findBenchmarkByName(name).then(useCaseResult);
  }
}

export class ListBenchmarksByCategoryUseCase {
  constructor(private readonly benchmarkRegistry: AiBenchmarkRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListBenchmarksByCategoryResult>> {
    return this.benchmarkRegistry.listBenchmarksByCategory(category).then(useCaseResult);
  }
}

export class GetBenchmarkRegistryStatisticsUseCase {
  constructor(private readonly benchmarkRegistry: AiBenchmarkRegistryService) {}

  execute(): Promise<UseCaseResult<BenchmarkRegistryStatistics>> {
    return this.benchmarkRegistry.getBenchmarkRegistryStatistics().then(useCaseResult);
  }
}
