import type {
  RegisterBenchmarkInput,
  UpdateBenchmarkInput,
} from "@server/application/ai-benchmark-registry/models/benchmark.model";
import {
  DeleteBenchmarkUseCase,
  FindBenchmarkByNameUseCase,
  GetBenchmarkRegistryStatisticsUseCase,
  GetBenchmarkUseCase,
  ListBenchmarksByCategoryUseCase,
  ListBenchmarksUseCase,
  RegisterBenchmarkUseCase,
  UpdateBenchmarkUseCase,
} from "@server/application/ai-benchmark-registry/use-cases/ai-benchmark-registry.use-cases";

/** Application facade for AI Benchmark Registry scenario. */
export class AiBenchmarkRegistryApplicationService {
  constructor(
    private readonly registerBenchmarkUseCase: RegisterBenchmarkUseCase,
    private readonly getBenchmarkUseCase: GetBenchmarkUseCase,
    private readonly listBenchmarksUseCase: ListBenchmarksUseCase,
    private readonly updateBenchmarkUseCase: UpdateBenchmarkUseCase,
    private readonly deleteBenchmarkUseCase: DeleteBenchmarkUseCase,
    private readonly findBenchmarkByNameUseCase: FindBenchmarkByNameUseCase,
    private readonly listBenchmarksByCategoryUseCase: ListBenchmarksByCategoryUseCase,
    private readonly getBenchmarkRegistryStatisticsUseCase: GetBenchmarkRegistryStatisticsUseCase,
  ) {}

  registerBenchmark(input: RegisterBenchmarkInput) {
    return this.registerBenchmarkUseCase.execute(input);
  }

  getBenchmark(benchmarkId: string) {
    return this.getBenchmarkUseCase.execute(benchmarkId);
  }

  listBenchmarks() {
    return this.listBenchmarksUseCase.execute();
  }

  updateBenchmark(input: UpdateBenchmarkInput) {
    return this.updateBenchmarkUseCase.execute(input);
  }

  deleteBenchmark(benchmarkId: string) {
    return this.deleteBenchmarkUseCase.execute(benchmarkId);
  }

  findBenchmarkByName(name: string) {
    return this.findBenchmarkByNameUseCase.execute(name);
  }

  listBenchmarksByCategory(category: string) {
    return this.listBenchmarksByCategoryUseCase.execute(category);
  }

  getBenchmarkRegistryStatistics() {
    return this.getBenchmarkRegistryStatisticsUseCase.execute();
  }
}
