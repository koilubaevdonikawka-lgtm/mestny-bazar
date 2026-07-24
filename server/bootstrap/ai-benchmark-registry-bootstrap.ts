import type { IBenchmarkCatalog } from "@server/application/ai-benchmark-registry/contracts/benchmark-catalog.contract";
import type { IBenchmarkRepository } from "@server/application/ai-benchmark-registry/contracts/benchmark-repository.contract";
import type { IBenchmarkSerializer } from "@server/application/ai-benchmark-registry/contracts/benchmark-serializer.contract";
import type { IBenchmarkStatisticsProvider } from "@server/application/ai-benchmark-registry/contracts/benchmark-statistics-provider.contract";
import type { IBenchmarkValidator } from "@server/application/ai-benchmark-registry/contracts/benchmark-validator.contract";
import {
  AiBenchmarkRegistryApplicationService,
  AiBenchmarkRegistryService,
  DeleteBenchmarkUseCase,
  FindBenchmarkByNameUseCase,
  GetBenchmarkRegistryStatisticsUseCase,
  GetBenchmarkUseCase,
  ListBenchmarksByCategoryUseCase,
  ListBenchmarksUseCase,
  RegisterBenchmarkUseCase,
  UpdateBenchmarkUseCase,
} from "@server/application/ai-benchmark-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { BenchmarkRepository } from "@server/infrastructure/ai-benchmark-registry/benchmark.repository";
import { DefaultBenchmarkCatalog } from "@server/infrastructure/ai-benchmark-registry/default-benchmark.catalog";
import { DefaultBenchmarkStatisticsProvider } from "@server/infrastructure/ai-benchmark-registry/default-benchmark-statistics.provider";
import { DefaultBenchmarkValidator } from "@server/infrastructure/ai-benchmark-registry/default-benchmark.validator";
import { JsonBenchmarkSerializer } from "@server/infrastructure/ai-benchmark-registry/json-benchmark.serializer";

/** Registers AI Benchmark Registry services and use cases. */
export function registerAiBenchmarkRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiBenchmarkRegistryBenchmarkRepository,
    () => new BenchmarkRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiBenchmarkRegistryBenchmarkCatalog,
    () => new DefaultBenchmarkCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiBenchmarkRegistryBenchmarkValidator,
    () => new DefaultBenchmarkValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiBenchmarkRegistryBenchmarkSerializer,
    () => new JsonBenchmarkSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiBenchmarkRegistryBenchmarkStatisticsProvider,
    () => new DefaultBenchmarkStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiBenchmarkRegistryService,
    (provider) =>
      new AiBenchmarkRegistryService(
        provider.resolve<IBenchmarkRepository>(
          InfrastructureTokens.AiBenchmarkRegistryBenchmarkRepository,
        ),
        provider.resolve<IBenchmarkCatalog>(
          InfrastructureTokens.AiBenchmarkRegistryBenchmarkCatalog,
        ),
        provider.resolve<IBenchmarkValidator>(
          InfrastructureTokens.AiBenchmarkRegistryBenchmarkValidator,
        ),
        provider.resolve<IBenchmarkSerializer>(
          InfrastructureTokens.AiBenchmarkRegistryBenchmarkSerializer,
        ),
        provider.resolve<IBenchmarkStatisticsProvider>(
          InfrastructureTokens.AiBenchmarkRegistryBenchmarkStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiBenchmarkRegistryRegisterBenchmarkUseCase,
    (provider) =>
      new RegisterBenchmarkUseCase(
        provider.resolve<AiBenchmarkRegistryService>(
          InfrastructureTokens.AiBenchmarkRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiBenchmarkRegistryGetBenchmarkUseCase,
    (provider) =>
      new GetBenchmarkUseCase(
        provider.resolve<AiBenchmarkRegistryService>(
          InfrastructureTokens.AiBenchmarkRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiBenchmarkRegistryListBenchmarksUseCase,
    (provider) =>
      new ListBenchmarksUseCase(
        provider.resolve<AiBenchmarkRegistryService>(
          InfrastructureTokens.AiBenchmarkRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiBenchmarkRegistryUpdateBenchmarkUseCase,
    (provider) =>
      new UpdateBenchmarkUseCase(
        provider.resolve<AiBenchmarkRegistryService>(
          InfrastructureTokens.AiBenchmarkRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiBenchmarkRegistryDeleteBenchmarkUseCase,
    (provider) =>
      new DeleteBenchmarkUseCase(
        provider.resolve<AiBenchmarkRegistryService>(
          InfrastructureTokens.AiBenchmarkRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiBenchmarkRegistryFindBenchmarkByNameUseCase,
    (provider) =>
      new FindBenchmarkByNameUseCase(
        provider.resolve<AiBenchmarkRegistryService>(
          InfrastructureTokens.AiBenchmarkRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiBenchmarkRegistryListBenchmarksByCategoryUseCase,
    (provider) =>
      new ListBenchmarksByCategoryUseCase(
        provider.resolve<AiBenchmarkRegistryService>(
          InfrastructureTokens.AiBenchmarkRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiBenchmarkRegistryGetBenchmarkRegistryStatisticsUseCase,
    (provider) =>
      new GetBenchmarkRegistryStatisticsUseCase(
        provider.resolve<AiBenchmarkRegistryService>(
          InfrastructureTokens.AiBenchmarkRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiBenchmarkRegistryApplicationService,
    (provider) =>
      new AiBenchmarkRegistryApplicationService(
        provider.resolve<RegisterBenchmarkUseCase>(
          InfrastructureTokens.AiBenchmarkRegistryRegisterBenchmarkUseCase,
        ),
        provider.resolve<GetBenchmarkUseCase>(
          InfrastructureTokens.AiBenchmarkRegistryGetBenchmarkUseCase,
        ),
        provider.resolve<ListBenchmarksUseCase>(
          InfrastructureTokens.AiBenchmarkRegistryListBenchmarksUseCase,
        ),
        provider.resolve<UpdateBenchmarkUseCase>(
          InfrastructureTokens.AiBenchmarkRegistryUpdateBenchmarkUseCase,
        ),
        provider.resolve<DeleteBenchmarkUseCase>(
          InfrastructureTokens.AiBenchmarkRegistryDeleteBenchmarkUseCase,
        ),
        provider.resolve<FindBenchmarkByNameUseCase>(
          InfrastructureTokens.AiBenchmarkRegistryFindBenchmarkByNameUseCase,
        ),
        provider.resolve<ListBenchmarksByCategoryUseCase>(
          InfrastructureTokens.AiBenchmarkRegistryListBenchmarksByCategoryUseCase,
        ),
        provider.resolve<GetBenchmarkRegistryStatisticsUseCase>(
          InfrastructureTokens.AiBenchmarkRegistryGetBenchmarkRegistryStatisticsUseCase,
        ),
      ),
  );
}
